FROM debian
MAINTAINER Maxime Bret
RUN apt-get update && apt-get install git curl nano -y
RUN curl -sL https://deb.nodesource.com/setup_7.x | bash - && apt-get install -y nodejs
COPY ./entrypoint.sh /home
RUN chmod +x /home/entrypoint.sh
#RUN ./home/entrypoint.sh
EXPOSE 3000
#CMD top
#CMD /home/entrypoint.sh
#ENTRYPOINT ["./home/entrypoint.sh", "-D", "FOREGROUND"]