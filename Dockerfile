FROM python:3.8

ARG DEBIAN_FRONTEND=noninteractive
ENV TZ=Europe/Madrid

RUN apt update
RUN apt install -y git
RUN apt install -y curl
RUN curl -fsSL https://code-server.dev/install.sh | sh
WORKDIR /home/hello
RUN apt install -y docker.io
RUN git config --global user.email "codelrond@protonmail.com"
RUN git config --global user.name "Lord Codelrond"
CMD ["code-server", "--auth", "password", "--bind-addr", "0.0.0.0:8080", "/app/hello"]
