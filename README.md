graffitiwall
============

HTML5 Canvas node.js socket.io masterpiece

Deployment instructions
=======================
- Install build-essential for fast extensions

```bash
    sudo apt-get install build-essential
```
- Install node
- install socket.io

```bash
    sudo npm install socket.io
```
- Install mysql library

```bash
    sudo npm install mysql@2.0.0-alpha3
```
- Allow server through firewall

```bash
    sudo ufw allow 12346
```
- Symlink walljs to supervisord

```bash
    sudo ln -s /var/www/graffitiwall/config/walljs.conf /etc/supervisor/conf.d/
```
- Reload supervisord

```bash
    sudo supervisorctl
    > reload
    > status
```
