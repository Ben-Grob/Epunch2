const sdk = require('node-appwrite');

module.exports = async function (context) {
  // 1. Initialize the Client with Admin permissions
  const client = new sdk.Client()
    .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
    .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY); // Must have users.write permission

  const users = new sdk.Users(client);

  // 2. Parse the data sent from your React Native app
  let payload;
  try {
    payload = JSON.parse(context.req.body);
  } catch (e) {
    return context.res.json({ error: 'Invalid JSON input' }, 400);
  }

  const { userId, role } = payload;

  if (!userId || !role) {
    return context.res.json({ error: 'Missing userId or role' }, 400);
  }

  try {
    // 3. Update the labels (This is your snippet in action!)
    // We wrap role in an array: [role]
    await users.updateLabels(userId, [role]);

    return context.res.json({ 
      status: 'success', 
      message: `User ${userId} is now labeled as ${role}` 
    });
  } catch (err) {
    context.error(err.message);
    return context.res.json({ error: err.message }, 500);
  }
};
