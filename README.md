1- con v0 hacemos la interface, me creo data que es mock

2- obtenemos las credenciales de usuario de google drive:
I'll guide you through setting up Google Drive integration step by step.
First, let's create a Google Cloud Project and enable the Google Drive API:
Go to the Google Cloud Console
Create a new project or select an existing one
In the left sidebar, go to "APIs & Services" > "Library"
Search for "Google Drive API" and enable it
Set up OAuth 2.0 credentials:
In the Google Cloud Console, go to "APIs & Services" > "Credentials"
Click "Create Credentials" > "OAuth client ID"
If prompted, configure the OAuth consent screen:
Choose "External" user type
Fill in the app name, user support email, and developer contact information
Add the necessary scopes (at minimum, add https://www.googleapis.com/auth/drive.file)
Add your domain to the authorized domains
Create OAuth client ID:
Choose "Web application" as the application type
Add authorized JavaScript origins:
http://localhost:3000 (for development)
Your production domain (if you have one)
Add authorized redirect URIs:
http://localhost:3000/api/auth/callback/google (for development)
Your production callback URL (if you have one)
Note down your Client ID and Client Secret

2.1 puedo ver el cliente creado en esta direccion, ademas puedo agregar el url cuando
este en produccion
https://console.cloud.google.com/auth/clients

3 en .env.local
# Google OAuth Credentials
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=       # Generate a random string for this

4 instalar los paquetes
npm install next-auth @auth/core googleapis

