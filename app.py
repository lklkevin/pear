from backend.app import app

# This allows Vercel to import the Flask app
# Keep the if statement for local development
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True) 