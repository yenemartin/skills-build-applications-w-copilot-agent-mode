import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function badRequest(message: string) {
  const error = new Error(message) as Error & { status?: number };
  error.status = 400;
  return error;
}

function notFound(message: string) {
  const error = new Error(message) as Error & { status?: number };
  error.status = 404;
  return error;
}

function normalizeEmail(email: string) {
  return decodeURIComponent(email).trim().toLowerCase();
}

export async function listActivities() {
  return Activity.find().sort({ occurredAt: -1 }).lean();
}

export async function createActivity(input: unknown) {
  const payload = (input ?? {}) as Record<string, unknown>;
  const userId = typeof payload.userId === 'string' ? payload.userId.trim() : '';
  const teamId = typeof payload.teamId === 'string' ? payload.teamId.trim() : '';
  const type = typeof payload.type === 'string' ? payload.type.trim() : '';
  const minutesValue = payload.minutes;

  if (!userId || !teamId || !type || minutesValue === undefined || minutesValue === null || Number.isNaN(Number(minutesValue))) {
    throw badRequest('User, team, type, and minutes are required.');
  }

  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(teamId)) {
    throw badRequest('userId and teamId must be valid Mongo ObjectIds.');
  }

  const minutes = Number(minutesValue);
  if (!Number.isFinite(minutes) || minutes <= 0) {
    throw badRequest('minutes must be a positive number.');
  }

  const [user, team] = await Promise.all([User.findById(userId), Team.findById(teamId)]);
  if (!user) throw notFound('User not found.');
  if (!team) throw notFound('Team not found.');

  const activity = await Activity.create({
    user: user._id,
    team: team._id,
    type,
    minutes,
    points: Math.max(1, Math.round(minutes)),
    occurredAt: new Date(),
  });

  return activity.toObject();
}

export async function listTeams() {
  return Team.find().sort({ name: 1 }).lean();
}

export async function createTeam(input: unknown) {
  const payload = (input ?? {}) as Record<string, unknown>;
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const mascot = typeof payload.mascot === 'string' ? payload.mascot.trim() : '';
  const membersValue = Array.isArray(payload.members) ? payload.members : [];

  if (!name || !mascot) {
    throw badRequest('Team name and mascot are required.');
  }

  const members = membersValue
    .map((value) => (typeof value === 'string' ? value.trim() : ''))
    .filter(Boolean);

  for (const member of members) {
    if (!mongoose.isValidObjectId(member)) {
      throw badRequest('Each member must be a valid Mongo ObjectId.');
    }
  }

  const team = await Team.create({ name, mascot, members });
  return team.toObject();
}

export async function getLeaderboard() {
  const grouped = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1, _id: 1 } },
  ]);

  if (grouped.length === 0) return [];

  const teamIds = grouped.map((entry) => entry._id);
  const teams = await Team.find({ _id: { $in: teamIds } }, { name: 1 }).lean();
  const teamMap = new Map(teams.map((team) => [team._id.toString(), team.name]));

  return grouped.map((entry, index) => ({
    teamName: teamMap.get(entry._id.toString()) ?? 'Unknown team',
    totalPoints: Number(entry.totalPoints) || 0,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const normalizedEmail = normalizeEmail(userEmail);
  const user = await User.findOne({ email: normalizedEmail }).lean();

  if (!user) {
    throw notFound('User not found.');
  }

  const recentActivities = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(5).lean();
  const recentType = recentActivities[0]?.type ?? user.fitnessGoal ?? 'endurance';
  const inferredFocus = (user.fitnessGoal ?? recentType).toLowerCase().includes('strength') || String(recentType).toLowerCase().includes('strength')
    ? 'strength'
    : 'endurance';

  const matchingWorkouts = await Workout.find({ focus: inferredFocus }).sort({ title: 1 }).lean();
  const candidates = matchingWorkouts.length > 0 ? matchingWorkouts : await Workout.find().sort({ title: 1 }).lean();

  return candidates.map((workout) => ({
    ...workout,
    reason: `Based on your recent ${String(recentType)} activity and ${String(user.fitnessGoal ?? 'fitness')} goal, this ${workout.focus} workout is a strong match.`,
  }));
}

export { User };
