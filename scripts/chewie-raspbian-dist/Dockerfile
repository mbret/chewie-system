FROM debian
MAINTAINER Maxime Bret
RUN apt-get update && apt-get install git curl dos2unix nano -y
RUN curl -sL https://deb.nodesource.com/setup_7.x | bash - && apt-get install -y nodejs
COPY ./entrypoint.sh /usr/local/bin
RUN chmod +x /usr/local/bin/entrypoint.sh
RUN dos2unix /usr/local/bin/entrypoint.sh
# PORT 4000:app 4022:ssh
EXPOSE 4000
ENTRYPOINT ["bash", "-c", "/usr/local/bin/entrypoint.sh"]