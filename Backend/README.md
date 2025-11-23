# Docker guide

## Setup Docker image
1. **Open backend folder**
    - cd Backend/

2. **Create docker image**
    - docker build -t "image-name" .

3. **Create docker container**
    - docker run --name "container-name" -p 8000:8000 "image-name"