# archmap_admin

# Node.js Express App for File Download and Upload to Google Cloud Storage

This Node.js application demonstrates how to download files from a given URL and then upload them to Google Cloud Storage (GCS). It utilizes several key Node.js modules such as Express, @google-cloud/storage, and others for handling HTTP requests, interacting with Google Cloud Storage, and managing file downloads and uploads.

## Features

- Download files from specified URLs.
- Upload downloaded files to Google Cloud Storage.
- Extract and upload contents of `.tar`, `.tar.gz`, and `.zip` files to Google Cloud Storage (experimental feature, see commented code).

## Prerequisites

Before you start, ensure you have the following prerequisites installed and set up:

- Node.js and npm
- A Google Cloud Platform (GCP) account
- A Google Cloud Storage bucket
- A GCP service account key file

## Setup and Configuration

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install Dependencies**

   Navigate to your project directory and run:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**

   Create a .env file and add the following variables

   ```
   PORT=8080
   GCP_PROJECT_ID=your-google-cloud-project-id
   GCP_BUCKET_NAME=your-google-cloud-storage-bucket-name
   GCP_KEYFILE=path-to-your-service-account-key.json
   ```

4. **Running the Application**

   Start the server with:

   ```bash
   npm start
   ```

   The server will start listening on the port specified in your `.env` file (default is 8080).

## Usage

To use the application, send a `POST` request to `/download` with a JSON body containing the URL of the file to download, the path to store the file in your GCS bucket, and the file name.

Example request:

```json
POST /download
{
    "url": "https://example.com/file.zip",
    "path_to_store": "path/in/your/bucket",
    "file_name": "file.zip"
}
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
