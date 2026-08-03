# Deploy UmNi on one AWS EC2 instance

This runbook deploys the complete application with Docker Compose. The EC2 host needs Docker, Docker Compose, and Git only. Maven, Java, Node.js, MongoDB, and MySQL are not installed on the server.

## 1. Prepare the external services

Before creating the EC2 instance, keep these values ready:

- MongoDB Atlas connection string
- Existing MySQL connection URL, username, and password
- DeepSeek API key
- OpenAI API key
- S3 bucket name, region, access key, and secret key

MongoDB Atlas and the MySQL provider must allow connections from the EC2 public IP. Database usernames and passwords containing reserved URL characters must be URL-encoded in their connection strings.

## 2. Launch the EC2 instance

Recommended for this five-container demonstration:

- Ubuntu Server 24.04 LTS
- At least 4 GB RAM
- At least 20 GB gp3 storage
- An Elastic IP so database allowlists and the browser URL do not change

Configure the EC2 security group with only these inbound rules:

| Type | Port | Source |
|---|---:|---|
| SSH | 22 | Your own public IP only |
| HTTP | 80 | 0.0.0.0/0 and ::/0 |

Do not add inbound rules for 8761, 8080, 8082, or 8083. Docker Compose keeps those services inside its bridge network.

## 3. Connect and install Docker

Connect using the key selected when the instance was created:

~~~bash
ssh -i <KEY_FILE.pem> ubuntu@<EC2_PUBLIC_IP>
~~~

Install Git and Docker Engine from Docker's official Ubuntu repository:

~~~bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

sudo tee /etc/apt/sources.list.d/docker.sources > /dev/null <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc
EOF

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker "$USER"
~~~

Disconnect and reconnect once so the Docker group membership takes effect. Then verify:

~~~bash
docker --version
docker compose version
~~~

Official references:

- [Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/)
- [Docker Compose plugin](https://docs.docker.com/compose/install/linux/)
- [Amazon EC2 security groups](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/creating-security-group.html)

## 4. Clone and configure UmNi

~~~bash
git clone https://github.com/umairrrkhan/cadc-project-umair-moni.git
cd cadc-project-umair-moni
cp .env.example .env
nano .env
~~~

Replace every angle-bracket placeholder. Generate a strong shared JWT secret with:

~~~bash
openssl rand -base64 48
~~~

Important:

- JWT_SECRET must be identical for Core Service and Note Service; Compose supplies the same value to both.
- CORS_ALLOWED_ORIGINS must exactly match the browser origin, for example http://203.0.113.10, without a trailing slash.
- Never commit or paste the populated .env file into GitHub.

## 5. Deploy

~~~bash
chmod +x deploy.sh
./deploy.sh
~~~

The first deployment downloads base images and builds every application, so it takes longer than later updates. A successful run ends with the Compose service table and:

~~~text
UmNi deployment completed successfully.
~~~

Open http://<EC2_PUBLIC_IP> in the browser.

## 6. Verify and troubleshoot

~~~bash
docker compose ps
curl http://localhost/health
docker compose logs --tail=100
~~~

Every service should become healthy. For one service:

~~~bash
docker compose logs --tail=200 core-service
docker compose logs --tail=200 note-service
docker compose logs --tail=200 api-gateway
~~~

If a database-backed service stays unhealthy, check the external provider's IP allowlist and the matching .env connection string.

## 7. Deploy later updates

~~~bash
git pull --ff-only
./deploy.sh
~~~

To stop the application without deleting images:

~~~bash
docker compose down
~~~
