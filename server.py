import os
import sys
import json
import uuid
from http.server import HTTPServer, SimpleHTTPRequestHandler

CONFIG_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'config.json')

ACTIVE_SESSIONS = set()

def load_config():
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"[!] Error loading config: {e}")
    return {}

def save_config(data):
    os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)
    with open(CONFIG_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

class CustomHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Cache-Control', 'no-cache, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        # Health check endpoint for Render.com
        if self.path == '/health':
            self.send_response(200)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write(b'OK')
            return

        # Redirect /admin to /admin.html
        if self.path == '/admin':
            self.send_response(302)
            self.send_header('Location', '/admin.html')
            self.end_headers()
            return

        # API: Get current config (contacts, locations, pricing)
        if self.path == '/api/config':
            cfg = load_config()
            # Don't expose admin password in public config
            public_cfg = {
                "contacts": cfg.get("contacts", {}),
                "pricing": cfg.get("pricing", {}),
                "locations": cfg.get("locations", [])
            }
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(public_cfg, ensure_ascii=False).encode('utf-8'))
            return

        return super().do_GET()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        try:
            payload = json.loads(body.decode('utf-8')) if body else {}
        except Exception:
            payload = {}

        # API: Admin Login
        if self.path == '/api/login':
            username = payload.get('username', '').strip()
            password = payload.get('password', '').strip()

            cfg = load_config()
            admin_data = cfg.get('admin', {})

            # Environment variables take priority if set on Render
            expected_user = os.environ.get('ADMIN_USER', admin_data.get('username', 'admin'))
            expected_pass = os.environ.get('ADMIN_PASS', admin_data.get('password', 'vendigo2026'))

            if username == expected_user and password == expected_pass:
                token = str(uuid.uuid4())
                ACTIVE_SESSIONS.add(token)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "ok", "token": token}).encode('utf-8'))
            else:
                self.send_response(401)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": "Невірний логін або пароль"}).encode('utf-8'))
            return

        # API: Update Config (requires auth token)
        if self.path == '/api/config':
            auth_token = self.headers.get('Authorization', '').replace('Bearer ', '').strip()
            # Allow update if session is active or if matching password is provided in payload
            token_valid = auth_token in ACTIVE_SESSIONS

            if not token_valid:
                self.send_response(403)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": "Авторизація застаріла"}).encode('utf-8'))
                return

            cfg = load_config()
            if 'contacts' in payload:
                cfg['contacts'] = payload['contacts']
            if 'pricing' in payload:
                cfg['pricing'] = payload['pricing']
            if 'locations' in payload:
                cfg['locations'] = payload['locations']
            if 'new_password' in payload and payload['new_password']:
                cfg['admin']['password'] = payload['new_password']

            save_config(cfg)

            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "message": "Зміни успішно збережено!"}).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()

def run():
    port = int(os.environ.get('PORT', 8080))
    server_address = ('0.0.0.0', port)
    
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    httpd = HTTPServer(server_address, CustomHandler)
    print(f"[*] VendiGo server started successfully on http://0.0.0.0:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.server_close()

if __name__ == '__main__':
    run()
