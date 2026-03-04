import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

async function copyPagefind() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const source = path.join(__dirname, '../out/pagefind');
    const destination = path.join(__dirname, '../public/pagefind');

    try {
        if (!fs.existsSync(source)) {
            console.warn('⚠️  Pagefind index not found in /out');
            console.warn('   Run "npm run build" to generate it.');
            console.warn('   The search will not be available in dev mode until you build.');
            return;
        }

        // Supprimer l'ancien index si existant
        if (fs.existsSync(destination)) {
            await fs.remove(destination);
            console.log('🗑️  Removed old Pagefind index from public/');
        }

        // Copier le nouvel index
        await fs.copy(source, destination, { overwrite: true });
        console.log('✅ Pagefind index copied to public/ successfully');
        console.log('   Search is now available in development mode');
    } catch (error) {
        console.error('❌ Error copying Pagefind index:', error.message);
        process.exit(1);
    }
}

copyPagefind();
