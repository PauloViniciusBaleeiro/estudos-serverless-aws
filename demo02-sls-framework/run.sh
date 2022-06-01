# instalar
npm i -g serverless

# inicializar
sls

# fazer deploy do ambiente
sls deploy 

# invocar ambiente na AWS
sls invoke -f hello

#invocar localmente
sls invoke local -f hello -log

# logs
sls logs -f hello -tee

# remover
sls remove