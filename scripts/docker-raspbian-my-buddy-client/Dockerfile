FROM debian
MAINTAINER Maxime Bret
# global dependencies
RUN apt-get update && apt-get install git curl nano -y
RUN curl -sL https://deb.nodesource.com/setup_7.x | bash - && apt-get install -y nodejs
# project dependencies
RUN apt-get install mplayer -y
COPY ./entrypoint.sh /home
RUN chmod +x /home/entrypoint.sh
RUN ./home/entrypoint.sh
EXPOSE 3000
#ENTRYPOINT ["/home/entrypoint.sh", "-D", "FOREGROUND"]