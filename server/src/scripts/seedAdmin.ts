import dotenv from 'dotenv';
import { globalAuthService } from '../auth/authService.js';

dotenv.config();

async function runAdminReset() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('❌ Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.');
    console.error('   Example:');
    console.error('   ADMIN_EMAIL=admin@yourdomain.com ADMIN_PASSWORD=YourSecurePass npm run seed:admin');
    process.exit(1);
  }

  console.log('🔄 Initializing/Resetting NOVA AI Administrator Account in Supabase Auth...');
  const admin = await globalAuthService.seedAdmin(email, password);

  console.log('✅ Admin account configured successfully:');
  console.log(`   - Email: ${admin.email}`);
  console.log(`   - Role: ${admin.role}`);
  console.log(`   - ID: ${admin.id}`);
  console.log(`   - Status: Active & Secured (Persistent Supabase Auth)`);
}

runAdminReset().catch((err) => {
  console.error('❌ Failed to seed admin:', err.message || err);
  process.exit(1);
});
