const fs = require('fs');
const path = require('path');

// Function to copy environment files from templates
function copyEnvironmentFiles() {
  const environmentsDir = path.join(__dirname, '../src/environments');
  
  // Copy production environment
  const prodTemplatePath = path.join(environmentsDir, 'environment.prod.template.ts');
  const prodTargetPath = path.join(environmentsDir, 'environment.prod.ts');
  
  if (fs.existsSync(prodTemplatePath)) {
    fs.copyFileSync(prodTemplatePath, prodTargetPath);
    console.log('✅ Copied environment.prod.template.ts to environment.prod.ts');
  } else {
    console.error('❌ environment.prod.template.ts not found');
    process.exit(1);
  }
  
  // Copy development environment if needed
  const devTemplatePath = path.join(environmentsDir, 'environment.template.ts');
  const devTargetPath = path.join(environmentsDir, 'environment.ts');
  
  if (fs.existsSync(devTemplatePath) && !fs.existsSync(devTargetPath)) {
    fs.copyFileSync(devTemplatePath, devTargetPath);
    console.log('✅ Copied environment.template.ts to environment.ts');
  }
}

// Run the function
try {
  copyEnvironmentFiles();
  console.log('🎉 Environment files prepared successfully');
} catch (error) {
  console.error('❌ Error preparing environment files:', error.message);
  process.exit(1);
}
