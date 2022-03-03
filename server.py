import http.server
import socketserver

PORT = 9292
handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), handler) as http_server:
    print("Open app at: http://localhost:" + str(PORT) + "/index.html")
    http_server.serve_forever()
