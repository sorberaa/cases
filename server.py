import os
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler

class CustomHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS and caching headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, must-revalidate')
        super().end_headers()

    def do_GET(self):
        # Health check endpoint for Render.com
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'OK')
            return
        return super().do_GET()

def run():
    # Render provides PORT in environment variable
    port = int(os.environ.get('PORT', 8080))
    server_address = ('0.0.0.0', port)
    
    # Change current working directory to directory of server.py
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    httpd = HTTPServer(server_address, CustomHandler)
    print(f"[*] PrintCase server started successfully on http://0.0.0.0:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()

if __name__ == '__main__':
    run()
