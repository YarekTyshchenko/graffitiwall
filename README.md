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
- Install dependancies through npm:

```bash
    sudo npm install socket.io mongodb underscore
```
- Install mysql library if you want to use mongo migration script

```bash
    sudo npm install mysql
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
