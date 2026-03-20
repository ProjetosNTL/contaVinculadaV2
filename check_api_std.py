import http.client
import json

conn = http.client.HTTPConnection("localhost", 3000)
conn.request("GET", "/api/cadastro/projeto/ativos")
res = conn.getresponse()
data = res.read()
print(f"Status: {res.status}")
print(f"Body: {data.decode('utf-8')}")
