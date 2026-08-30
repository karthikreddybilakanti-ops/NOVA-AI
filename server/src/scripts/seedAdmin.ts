import dotenv from 'dotenv';
import { globalAuthStore } from '../auth/authStore.js';

dotenv.config();

function runAdminReset() {
  const email = process.env.ADMIN_EMAIL || 'admin@nova.ai';
  const password = process.env.ADMIN_PASSWORD || 'admin123';

  console.log('🔄 Initializing/Resetting NOVA AI Administrator Account...');
  const admin = globalAuthStore.resetAdmin(email, password);

  console.log('✅ Admin account configured successfully:');
  console.log(`   - Email: ${admin.email}`);
  console.log(`   - Role: ${admin.role}`);
  console.log(`   - ID: ${admin.id}`);
  console.log(`   - Status: Active & Secured (bcrypt hashed)`);
}

runAdminReset();
