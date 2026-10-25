#!/usr/bin/env python3
# Терракино: личный сервер для Termux (только стандартная библиотека Python)
import os, re, json, time, mimetypes, base64, shutil, socket, ipaddress
import urllib.request, urllib.error, threading, queue
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import unquote, urlparse, urlsplit, parse_qs

HOST = "127.0.0.1"  # 127.0.0.1 = сайт виден только с этого телефона
PORT = int(os.environ.get("TERRA_PORT") or 8080)
ROOT = os.path.realpath(os.environ.get("TERRA_ROOT") or os.path.dirname(os.path.realpath(__file__)))  # папка с видео
CLOUD = os.environ.get("TERRA_CLOUD") or ""  # cloud.json с адресом базы аккаунтов (необязателен)
APP = os.environ.get("TERRA_APP") or ROOT  # где лежит index.html (в приложении для Android он отдельно от видео)
PEND = os.path.join(ROOT, ".pending.json")
EXT = (".mp4", ".mkv", ".webm", ".m4v", ".mov", ".avi")
AEXT = (".m4a", ".mp3", ".aac", ".opus", ".ogg", ".oga", ".weba", ".wav", ".flac", ".webm", ".mka")
DIRS = {"Сериалы": "series", "Фильмы": "movie", "Мультики": "cartoon", "Видео": "video"}
POSTERS = ("poster.jpg", "poster.jpeg", "poster.png", "poster.webp")
MANIFEST = {
    "name": "Терракино", "short_name": "Терракино", "start_url": "/", "display": "standalone",
    "background_color": "#F6EFE6", "theme_color": "#F6EFE6",
    "icons": [
        {"src": "/icon-192.png?v=3", "sizes": "192x192", "type": "image/png", "purpose": "any maskable"},
        {"src": "/icon-512.png?v=3", "sizes": "512x512", "type": "image/png", "purpose": "any maskable"},
    ],
}
ICONS = {  # иконка сайта (терракотовый плей и маленькая искорка)
    "icon-192.png": "iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAMAAABlApw1AAAB4FBMVEX//PH/+e3/+Oz+9+v+9ur/9er99er99en99ej89en99Oj89On89Oj89Of88+f78+f78ub68eX58OT57+P47uL37eD269/16t306dz06Nvz59ry5djx5Nfw49bv4dTu4NPt39Lu3dDs3dDr3M/q2s3p2czp18rn1snm1cjn08Xl08bk0cTj0MPiz8LhzsDgzL/gy73eyrzgyLndx7rcxrjbxbfbxLbaw❯XZwbPXv7HYva/VvK7Uu6zataTSuKnRtqjPtKbNsaLLrp/KrJ7RqJXIqprHqJnGp5jFpZbEpJXDopPCoZLBoJSAn4/DnIu+m4y9morAl4bShWi5lYW1j3+wiHergG/he1XgeVTeeVTddlLbdVHadVHZdFDYc0/Md1ild2bYck7WcU7VcU3UcEzTb0zRb0zTbkrRbkrPbEnOa0jLaEbIaUjHZkTGZUPFZELEY0LEYkDBYkDAYD+ua1SaaFa/Xz2+Xj29Xj28XTy7XDy6Wzu5Wjq4Wjq4WTm3WTm3WDi1Wju2WDi1Vze0Vze0VjezVTayVjexVDWwUzSuUzWeV0CtUDKrTzKnTzKnTC6lTDCkTjKkTDCjSi6gSi6YSjKgRyueRyydRyycRiubRSqWRSybRCmZRCmXQymOPiXkei4FAABWv0lEQVR42p29iWMS1/r/D4Fb2lwk7IQdWQbKPg7LjBCYAYYdQQawsdrngbeuSGKtJcK1tY21jE4MxQbP8Ev1Xf88Zsif29vM9VVu1xud1nvezzZwZBNPT03dg3ebXrVu3bv74448/wPoerf+idQPWf/bXd+cu9Dv/RT+g/5X/M+gPo68CX+zHm/VV+a+O/p470/tr5mjNonV/sHm4nj4abm1tbW5tPn2x9/rhxu4OrFeP1j6sP1ra3YP1Yef15of9Jfgb+0+b/93frG+v3/gPIjlA+H4f4QTB7fMJkP3zg+FwuMKbv7X809I2AGxtbzxc3n3JA+xuPnuxubf5euPDHk9wtAS8/Xc+Zf8nzP/2YB38/Ma1XPPWrRvf/eckwnk+ONcFMy+3hlsvX2wh+4fzcxvbW9uD1d3B4+Hw4dNN5ICdtc29XX77TxEITjjgHPtPm//t2lz/eu7y5anrP3y3L6SzBH/ngpl7L98ON5fvr/IAy/d+BflsLy3vvXi2vbk82N5GAHvo+yHDMYB/ZP8p4785Wge/dCMXJScuNm/9HwiOeWB5c7g5mFviFbTx6KfV7c2trfXh9mCwA8aPAJD9m+//DgDc/OMI4LT9J8z/5uziAZoZnNCamat9/9915BH8rop/A/uH63NyQj4Cl2SdD8MAWhME2GI/WyP7t5WfLe+cCnAqA8+3/lPX7DP+5NhURe53ggxvfjYJ5n+CHQ4JPugDZv/kr+hciePFig1cSH8bbW5tg/9qLzd2dvcGT1e3dMy4QnBHQkf1nzP/uO97ar4+vA4QbOcYs1Dsu5a7duPE9+sPwxz9FcMIFs68g/2yuzjwfon9vbr7f2uI9MXLB8jLE7+M/kBM2NiAG9j4FcCIAzrMfbPzPteaNr89bI4QcJZeOa51Tuea1a98iFf1wi5clD/Hjj+eIaLT/609g75/Mb+wDHKzt5dXt7Y2X6zsQzryEdvfg29rpRCo4xwHH9HO4/WDg9Vu5S7euf/0phBvXc6ExhVyj1roeeQUbKXW2ide36tzzHD59ywcvB/enl4XCwvnka4CVUg+FwB37YGUXB9s7eKlSDky4Q3Pns9grAXFXlfv3+u8g9W9u/35y83N+8eTj+8OHt3d7L1evH319t3x+c3Gz6uHh/sfVzc3d5N2ff/xwdj/h/7gH17u7v0H//L8M8/f//xP/zv+/HlH+/Hh/f///j//8P//wH//z8A/w8='
}
mimetypes.add_type("video/mp4", ".m4v")
mimetypes.add_type("video/webm", ".mkv")
for _e, _t in ((".m4a", "audio/mp4"), (".opus", "audio/ogg"), (".weba", "audio/webm"), (".mka", "audio/webm"), (".aac", "audio/aac")):
    mimetypes.add_type(_t, _e)

def decrypt_token(tkn: str) -> str:
    p1 = tkn[:int(len(tkn)/2)][::-1]
    p2 = tkn[int(len(tkn)/2):][::-1]
    p1 = base64.b64decode(p1.encode('utf-8')).decode('utf-8')
    p2 = base64.b64decode(p2.encode('utf-8')).decode('utf-8')
    return p2 + p1

ENCRYPTED_TOKEN = "==QO0ADM3kTZmRTNiRDNjFDM==QOxkDMzQjZ4ADZ4YzNhZTN"
KODIK_TOKEN = decrypt_token(ENCRYPTED_TOKEN)


def clean(t):
    return re.sub(r'[\\/:*?"<>|\x00-\x1f]+', " ", t).strip(" .")[:80] or "Без названия"


def downloads():
    b = os.path.dirname(ROOT)
    return [os.path.join(b, "Download"), os.path.join(b, "Download", "Telegram"), os.path.join(b, "Movies"),
            os.path.join(b, "Telegram", "Telegram Video"), os.path.join(b, "Telegram", "Telegram Documents"),
            os.path.expanduser("~/storage/downloads")]


def natural(s):
    return [int(t) if t.isdigit() else t.lower() for t in re.split(r"(\d+)", s)]


def rel(f):
    return os.path.relpath(f, ROOT).replace(os.sep, "/")


def safe(r):
    f = os.path.realpath(os.path.join(ROOT, r))
    top = os.path.relpath(f, ROOT).split(os.sep)[0]
    return f if f.startswith(ROOT + os.sep) and top in DIRS else None


def pend_read():
    try:
        with open(PEND) as fh:
            return json.load(fh)
    except Exception:
        return {}


def pend_write(d):
    with open(PEND, "w") as fh:
        json.dump(d, fh)


def rm_all(r):
    f = safe(r)
    if not f:
        return
    try:
        os.remove(f)
    except OSError:
        pass
    stem = os.path.splitext(f)[0]
    for x in AEXT:
        o = f"{stem}.audio{x}"
        if os.path.isfile(o):
            try:
                os.remove(o)
            except OSError:
                pass


def aud(f):
    stem = os.path.splitext(f)[0]
    for x in AEXT:
        o = f"{stem}.audio{x}"
        if os.path.isfile(o):
            return {"1:1": rel(o)}
    return {}


def stats():
    used = 0
    for d in DIRS:
        for r, _, fs in os.walk(os.path.join(ROOT, d)):
            for f in fs:
                try:
                    used += os.path.getsize(os.path.join(r, f))
                except OSError:
                    pass
    du = shutil.disk_usage(ROOT)
    return {"used": used, "free": du.free, "total": du.total}


def sweep():
    p, now, ch = pend_read(), time.time(), False
    for r, t in list(p.items()):
        if t <= now:
            rm_all(r)
            del p[r]
            ch = True
    if ch:
        pend_write(p)


def vids(p):
    out = []
    for r, _, fs in os.walk(p):
        out += [os.path.join(r, f) for f in fs if f.lower().endswith(EXT) and ".audio." not in f.lower()]
    return sorted(out, key=lambda x: natural(os.path.relpath(x, p)))


def parse(f, base):
    n = os.path.basename(f)
    m = re.search(r"s(\d{1,2})[ ._-]*e(\d{1,3})", n, re.I) or re.search(r"\b(\d{1,2})x(\d{1,3})\b", n, re.I)
    if m:
        return int(m[1]), int(m[2])
    d = os.path.dirname(f)
    m = re.search(r"(\d+)", os.path.basename(d)) if d != base else None
    return (int(m[1]) if m else 1), None


def poster(d):
    for p in POSTERS:
        if os.path.isfile(os.path.join(d, p)):
            return rel(os.path.join(d, p))
    return None


def scan():
    items = []
    for dn, typ in DIRS.items():
        base = os.path.join(ROOT, dn)
        if not os.path.isdir(base):
            continue
        for name in sorted(os.listdir(base), key=natural):
            p = os.path.join(base, name)
            if typ in ("movie", "video"):
                if os.path.isfile(p) and p.lower().endswith(EXT) and ".audio." not in name.lower():
                    t = re.sub(r"\s*\[[\w-]{11}\]", "", re.sub(r"[._]+", " ", os.path.splitext(name)[0])).strip()
                    items.append({"title": t, "type": typ, "seasons": {"1": 1}, "files": {"1:1": rel(p)}, "audio": aud(p), "poster": None})
                elif os.path.isdir(p) and vids(p):
                    items.append({"title": name, "type": typ, "seasons": {"1": 1}, "files": {"1:1": rel(vids(p)[0])}, "audio": aud(vids(p)[0]), "poster": poster(p)})
                continue
            if not os.path.isdir(p):
                continue
            rows = [[f, *parse(f, p)] for f in vids(p)]
            used = {(s, e) for _, s, e in rows if e}
            cnt, files, seasons = {}, {}, {}
            for row in rows:
                f, s, e = row
                if not e:
                    e = cnt.get(s, 0) + 1
                    while (s, e) in used:
                        e += 1
                    cnt[s] = e
                    used.add((s, e))
                files[f"{s}:{e}"] = rel(f)
                seasons[str(s)] = max(seasons.get(str(s), 0), e)
            if files:
                items.append({"title": name, "type": typ, "seasons": seasons, "files": files, "poster": poster(p)})
    return items


UA = "Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36"


def public_url(u):
    try:
        p = urlsplit(u)
        if p.scheme not in ("http", "https") or not p.hostname:
            return False
        for ai in socket.getaddrinfo(p.hostname, p.port or (443 if p.scheme == "https" else 80)):
            ip = ipaddress.ip_address(ai[4][0].split("%")[0])
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast or ip.is_unspecified:
                return False
        return True
    except Exception:
        return False


class _Redir(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        if not public_url(newurl):
            raise urllib.error.URLError("redirect blocked")
        return super().redirect_request(req, fp, code, msg, headers, newurl)


OPENER = urllib.request.build_opener(_Redir)

JOBS, JQ = {}, queue.Queue()


def fetch_job(f, url, j):
    r = OPENER.open(urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"}), timeout=30)
    ct = (r.headers.get("Content-Type") or "").lower()
    if (getattr(r, "status", 200) or 200) != 200 or ct.startswith("text/") or "html" in ct:
        raise IOError("notvideo")
    total = int(r.headers.get("Content-Length") or 0)
    j["total"] = total
    os.makedirs(os.path.dirname(f), exist_ok=True)
    if total and shutil.disk_usage(os.path.dirname(f)).free < total + 300 * 1048576:
        raise IOError("space")
    tmp = f + ".part"
    try:
        with open(tmp, "wb") as fh:
            while True:
                if j["state"] == "cancel":
                    raise IOError("cancel")
                c = r.read(262144)
                if not c:
                    break
                fh.write(c)
                j["done"] += len(c)
        if total and j["done"] < total:
            raise IOError("short")
        stem = os.path.splitext(f)[0]
        for x in EXT:
            o = stem + x
            if o != f and os.path.isfile(o):
                os.remove(o)
        os.replace(tmp, f)
    except Exception:
        try:
            os.remove(tmp)
        except OSError:
            pass
        raise
    finally:
        r.close()


def worker():
    while True:
        r, f, url = JQ.get()
        j = JOBS.get(r)
        if not j or j["state"] != "queued":
            continue
        j["state"] = "run"
        try:
            fetch_job(f, url, j)
            if j["state"] == "run":
                j["state"] = "done"
        except Exception as e:
            if j["state"] != "cancel":
                j["state"], j["err"] = "error", str(e)[:80]


class H(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def search_handler(self, q):
        title = (q.get("q") or [""])[0].strip()
        if not title:
            return self.jsend({"results": []})
        
        search_url = f"https://shikimori.io/api/animes?search={urllib.parse.quote(title)}&limit=10"
        req = urllib.request.Request(search_url, headers={"User-Agent": "TerrakinoApp"})
        try:
            with OPENER.open(req, timeout=10) as r:
                shiki_data = json.loads(r.read().decode("utf-8", "ignore"))
                results = []
                for item in shiki_data:
                    image_url = item.get("image", {}).get("original", "")
                    if image_url and not image_url.startswith("http"):
                        image_url = "https://shikimori.io" + image_url
                    
                    shiki_id = item.get("id")
                    rus_title = item.get("russian") or item.get("name") or title
                    year = str(item.get("aired_on", ""))[:4]
                    kind = "Аниме-сериал" if item.get("kind") == "tv" else "Аниме-фильм"
                    fallback_episodes = item.get("episodes") or 1
                    
                    episodes_count = fallback_episodes
                    episodes_dict = {}
                    
                    if shiki_id:
                        kodik_url = f"https://kodik-api.com/search?token={KODIK_TOKEN}&shikimori_id={shiki_id}&with_episodes=true"
                        k_req = urllib.request.Request(kodik_url, headers={"User-Agent": "TerrakinoApp"})
                        try:
                            with OPENER.open(k_req, timeout=5) as k_resp:
                                k_data = json.loads(k_resp.read().decode("utf-8", "ignore"))
                                k_results = k_data.get("results", [])
                                if k_results:
                                    best_match = k_results[0]
                                    episodes_count = best_match.get("episodes_count") or fallback_episodes
                                    seasons = best_match.get("seasons", {})
                                    if seasons and "1" in seasons:
                                        episodes_dict = seasons["1"].get("episodes", {})
                        except Exception:
                            pass
                            
                    results.append({
                        "title": rus_title,
                        "year": year,
                        "type": kind,
                        "poster": image_url,
                        "shikimori_id": shiki_id,
                        "episodes": episodes_count,
                        "episodes_map": episodes_dict
                    })
                return self.jsend({"results": results})
        except Exception as e:
            return self.jsend({"results": [], "error": str(e)})

    def jsend(self, o, code=200):
        b = json.dumps(o, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def blob(self, b, ctype):
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(b)))
        self.send_header("Cache-Control", "max-age=3600")
        self.end_headers()
        self.wfile.write(b)

    def do_GET(self):
        u = unquote(urlparse(self.path).path)
        name = u.lstrip("/")
        if name == "favicon.ico":
            name = "icon-192.png"
        if name in ICONS:
            return self.blob(base64.b64decode(ICONS[name]), "image/png")
        if u == "/manifest.webmanifest":
            return self.blob(json.dumps(MANIFEST, ensure_ascii=False).encode(), "application/manifest+json; charset=utf-8")
        if u == "/cloud.json":
            try:
                with open(CLOUD or os.path.join(APP, "cloud.json"), "rb") as fh:
                    return self.blob(fh.read(), "application/json; charset=utf-8")
            except OSError:
                return self.send_error(404)
        if u == "/api/stats":
            return self.jsend(stats())
        if u == "/api/jobs":
            return self.jsend({"jobs": JOBS})
        if u == "/api/proxy":
            return self.proxy(parse_qs(urlparse(self.path).query))
        if u == "/api/library":
            sweep()
            return self.jsend({"items": scan()})
        if u == "/api/kodik" or u == "/api/search":
            return self.search_handler(parse_qs(urlparse(self.path).query))
        f = os.path.join(APP, "index.html") if u in ("/", "/index.html") else safe(u.lstrip("/"))
        if not f or not os.path.isfile(f):
            return self.send_error(404)
        size = os.path.getsize(f)
        a, b, code = 0, size - 1, 200
        m = re.match(r"bytes=(\d*)-(\d*)", self.headers.get("Range", ""))
        if m and (m[1] or m[2]):
            code = 206
            if m[1]:
                a = int(m[1])
                if m[2]:
                    b = min(int(m[2]), size - 1)
            else:
                a = max(0, size - int(m[2]))
            if a > b:
                self.send_response(416)
                self.send_header("Content-Range", f"bytes */{size}")
                self.end_headers()
                return
        self.send_response(code)
        self.send_header("Content-Type", mimetypes.guess_type(f)[0] or "application/octet-stream")
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Content-Length", str(b - a + 1))
        if code == 206:
            self.send_header("Content-Range", f"bytes {a}-{b}/{size}")
        self.end_headers()
        try:
            with open(f, "rb") as fh:
                fh.seek(a)
                left = b - a + 1
                while left > 0:
                    chunk = fh.read(min(262144, left))
                    if not chunk:
                        break
                    self.wfile.write(chunk)
                    left -= len(chunk)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def local_ok(self):
        host = (self.headers.get("Host") or "").rsplit(":", 1)[0].strip("[]").lower()
        org = self.headers.get("Origin")
        if org and (urlsplit(org).hostname or "") not in ("127.0.0.1", "localhost"):
            return False
        return host in ("127.0.0.1", "localhost")

    def fetch(self, q):
        if not self.local_ok():
            return self.jsend({"ok": False}, 403)
        url = (q.get("url") or [""])[0]
        if not public_url(url):
            return self.jsend({"ok": False, "error": "url"}, 400)
        ext = os.path.splitext(urlsplit(url).path)[1].lower()
        q = dict(q)
        q["name"], q["kind"] = ["x" + (ext if ext in EXT else ".mp4")], ["video"]
        t = self.target(q)
        if not t:
            return self.jsend({"ok": False}, 400)
        f = t[0]
        for x in EXT:
            o = os.path.splitext(f)[0] + x
            if os.path.isfile(o):
                return self.jsend({"ok": True, "state": "done", "path": rel(o)})
        r = rel(f)
        j = JOBS.get(r)
        if not (j and j["state"] in ("queued", "run")):
            JOBS[r] = {"state": "queued", "done": 0, "total": 0}
            JQ.put((r, f, url))
        self.jsend({"ok": True, "state": JOBS[r]["state"], "path": r})

    def fcancel(self, q):
        if not self.local_ok():
            return self.jsend({"ok": False}, 403)
        paths = list(JOBS) if q.get("all") else q.get("path", [])
        for r in paths:
            j = JOBS.get(r)
            if j and j["state"] in ("queued", "run"):
                j["state"] = "cancel"
        self.jsend({"ok": True})

    def proxy(self, q):
        host = (self.headers.get("Host") or "").rsplit(":", 1)[0].strip("[]").lower()
        if host not in ("127.0.0.1", "localhost"):
            return self.send_error(403)
        u = (q.get("u") or [""])[0]
        if not public_url(u):
            return self.send_error(400)
        hdr = {"User-Agent": UA, "Accept": "*/*"}
        if self.headers.get("Range"):
            hdr["Range"] = self.headers["Range"]
        try:
            r = OPENER.open(urllib.request.Request(u, headers=hdr), timeout=30)
        except urllib.error.HTTPError as e:
            r = e
        except Exception:
            return self.send_error(502)
        code = getattr(r, "status", None) or r.getcode() or 200
        ctype = r.headers.get("Content-Type") or ""
        if not ctype or ctype.startswith(("application/octet-stream", "binary/")):
            ctype = mimetypes.guess_type(urlsplit(u).path)[0] or ctype or "application/octet-stream"
        self.send_response(code)
        self.send_header("Content-Type", ctype)
        for k in ("Content-Length", "Content-Range", "Accept-Ranges", "Last-Modified"):
            v = r.headers.get(k)
            if v:
                self.send_header(k, v)
        self.end_headers()
        try:
            while True:
                chunk = r.read(262144)
                if not chunk:
                    break
                self.wfile.write(chunk)
        except Exception:
            pass
        finally:
            try:
                r.close()
            except Exception:
                pass

    def target(self, q):
        g = lambda k, d="": q.get(k, [d])[0]
        inv = {v: k for k, v in DIRS.items()}
        typ, name, kind = g("type"), g("name"), g("kind", "video")
        ext = os.path.splitext(name)[1].lower()
        try:
            s, e = int(g("s", "1")), int(g("e", "1"))
        except ValueError:
            return None
        if typ not in inv:
            return None
        single = typ in ("movie", "video")
        if kind == "audio":
            if not single or ext not in AEXT:
                return None
        elif ext not in EXT:
            return None
        t = clean(g("title"))
        if kind == "audio":
            r = f"{inv[typ]}/{t}.audio{ext}"
        elif single:
            r = f"{inv[typ]}/{t}{ext}"
        else:
            r = f"{inv[typ]}/{t}/S{s:02d}E{e:02d}{ext}"
        f = safe(r)
        return (f, name, g("size", "-1"), kind) if f else None

    def prep(self, f, kind):
        stem = os.path.splitext(f)[0]
        for x in (AEXT if kind == "audio" else EXT):
            o = stem + x
            if o != f and os.path.isfile(o):
                os.remove(o)

    def find_dl(self, name, size):
        for d in downloads():
            p = os.path.join(d, os.path.basename(name))
            try:
                if os.path.isfile(p) and os.path.getsize(p) == int(size):
                    return p
            except (OSError, ValueError):
                pass
        return None

    def move(self, q):
        t = self.target(q)
        if not t:
            return self.jsend({"ok": False}, 400)
        f, name, size, kind = t
        src = self.find_dl(name, size)
        if not src:
            return self.jsend({"ok": False, "error": "nofile"}, 404)
        os.makedirs(os.path.dirname(f), exist_ok=True)
        self.prep(f, kind)
        try:
            os.replace(src, f)
        except OSError:
            try:
                shutil.move(src, f)
            except Exception:
                return self.jsend({"ok": False, "error": "move"}, 500)
        self.jsend({"ok": True, "path": rel(f), "moved": True})

    def upload(self, q):
        t = self.target(q)
        if not t:
            return self.jsend({"ok": False, "error": "format"}, 400)
        f, name, size, kind = t
        try:
            n = int(self.headers.get("Content-Length", 0))
        except ValueError:
            return self.jsend({"ok": False}, 400)
        os.makedirs(os.path.dirname(f), exist_ok=True)
        tmp, left = f + ".part", n
        try:
            with open(tmp, "wb") as fh:
                while left > 0:
                    c = self.rfile.read(min(1 << 20, left))
                    if not c:
                        raise IOError("прервано")
                    fh.write(c)
                    left -= len(c)
        except Exception:
            try:
                os.remove(tmp)
            except OSError:
                pass
            return self.jsend({"ok": False}, 500)
        self.prep(f, kind)
        os.replace(tmp, f)
        removed = False
        src = self.find_dl(name, size)
        if src:
            try:
                os.remove(src)
                removed = True
            except OSError:
                pass
        self.jsend({"ok": True, "path": rel(f), "removed": removed})

    def do_POST(self):
        if not self.local_ok():
            return self.jsend({"ok": False}, 403)
        u = urlparse(self.path)
        if u.path == "/api/fetch":
            return self.fetch(parse_qs(u.query))
        if u.path == "/api/fetchcancel":
            return self.fcancel(parse_qs(u.query))
        if u.path == "/api/move":
            return self.move(parse_qs(u.query))
        if u.path == "/api/upload":
            return self.upload(parse_qs(u.query))
        try:
            n = int(self.headers.get("Content-Length", 0))
            d = json.loads(self.rfile.read(n) or b"{}")
        except Exception:
            return self.jsend({"ok": False}, 400)
        r = d.get("path", "")
        f = safe(r)
        if not f:
            return self.jsend({"ok": False}, 400)
        p = pend_read()
        if self.path == "/api/del":
            after = float(d.get("after", 86400))
            if after <= 0:
                rm_all(r)
                p.pop(r, None)
            else:
                p[r] = time.time() + after
        elif self.path == "/api/undel":
            p.pop(r, None)
        pend_write(p)
        self.jsend({"ok": True})


def start_server():
    sweep()
    threading.Thread(target=worker, daemon=True).start()
    httpd = ThreadingHTTPServer((HOST, PORT), H)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


if __name__ == "__main__":
    sweep()
    threading.Thread(target=worker, daemon=True).start()
    print(f"Терракино запущен: http://{HOST}:{PORT}")
    print("Папка:", ROOT)
    print("Остановить: Ctrl+C")
    ThreadingHTTPServer((HOST, PORT), H).serve_forever()