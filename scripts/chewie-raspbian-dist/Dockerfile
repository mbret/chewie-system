FROM debian
MAINTAINER Maxime Bret
# required
RUN apt-get update && apt-get install curl apt-transport-https -y
# yarn repo
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
# now release the power of thirds party dependencies and I suggest you to take a cup of cofee while waiting
RUN apt-get update && apt-get install git dos2unix nano yarn mplayer2 -y
# latest 7.x node
RUN curl -sL https://deb.nodesource.com/setup_7.x | bash - && apt-get install -y nodejs
COPY ./entrypoint.sh /usr/local/bin
RUN chmod +x /usr/local/bin/entrypoint.sh
RUN dos2unix /usr/local/bin/entrypoint.sh
# PORT 4000:app 4022:ssh
EXPOSE 3000 3001 4000
ENTRYPOINT ["bash", "-c", "/usr/local/bin/entrypoint.sh"]