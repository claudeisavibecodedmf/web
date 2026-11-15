export class UserError extends Error {}

export function serverError(e) {
  if (e instanceof UserError) return Response.json({ error: e.message }, { status: 400 });
  console.error(e);
  const missing = e?.message === 'DATABASE_URL is not set';
  return Response.json({
    error: missing
      ? 'Database is not configured (DATABASE_URL is missing).'
      : 'Server error. Please try again in a moment.',
  }, { status: 500 });
}
