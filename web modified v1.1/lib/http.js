export function serverError(e) {
  console.error(e);
  const missing = e?.message === 'DATABASE_URL is not set';
  return Response.json({
    error: missing
      ? 'Database is not configured (DATABASE_URL is missing).'
      : 'Server error. Open /api/health to check the database.',
  }, { status: 500 });
}
