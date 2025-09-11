File 1: /api/download/stream/[fileId]/route.ts

  Purpose: Downloads single files (like PDFs, images, videos)

  What it does:
  - Takes a single file ID (like "abc123")
  - Asks the backend for that specific file
  - Sends the file to your browser for download
  - Uses the original filename (like "my-document.pdf")
  - Works for individual file downloads 

  ## batch files
File 2: /api/batch/download-zip/[batchId]/route.ts

  Purpose: Downloads multiple files as a ZIP package

  What it does:
  - Takes a batch ID (like "batch456")
  - Asks the backend to create a ZIP file with ALL files in that batch
  - Sends the ZIP file to your browser
  - Names it "files-batch456.zip"
  - Works for downloading multiple files at once

 Why Two Separate Files?
 
  1. Both files: Get the ID from the URL
  2. Both files: Call the backend with that ID
  3. Both files: Return the file to download
  4. Both files: Handle errors if download fails

  The only real differences:
  - Single file: Works with one file at a time
  - Batch ZIP: Works with multiple files as a package

  This is like having two different delivery services:
  - One delivers individual packages
  - One delivers a box containing multiple packages

  
  why two file not combine?
  Why? Next.js API routes are file-based, not function-based. Each route must     
  be in its own file with the corresponding folder structure.

 Think of it like this:
  - You can't have two different web addresses (/api/download/stream/file123      
  and //api/batch/download-zip/batch456) handled by the same file
  - Each URL needs its own dedicated route file
  - This is how Next.js is designed to work
