# 1º passo criar o arquivo com políticas de segurança
  # Arquivo politica.json
# 2º criar a role de segurança no IAM
aws iam create-role \
  --role-name lambda-exemplo_n \
  --assume-role-policy-document file://politicas.json \
  | tee logs/role.log

# 3º Criar o projeto e zipá-lo
zip function.zip index.js

aws lambda create-function \
  --function-name hello-cli \
  --zip-file fileb://function.zip \
  --handler index.handler \
  --runtime nodejs12.x \
  --role arn:aws:iam::342116823538:role/lambda-exemplo_n \
  | tee logs/lambda-create.log

# 4º Invocar a lambda
aws lambda invoke \
  --function-name hello-cli \
  --log-type Tail \
  logs/lambda-exec.log

# -- atualizar, zipar
zip function.zip index.js

# -- atualizar lambda
aws lambda update-function-code \
  --zip-file fileb://function.zip \
  --function-name hello-cli \
  --publish \
  | tee logs/lambda-update.log

# invocar com o novo resultado


# remover para não deixar recursos ociosos
aws lambda delete-function \
  --function-name hello-cli

aws iam delete-role \
  --role-name  lambda-exemplo 

aws iam delete-role \
  --role-name  lambda-exemplo_n