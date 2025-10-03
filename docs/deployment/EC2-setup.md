# EC2 Deployment Guide - When3Meet

### **Important:** Never commit your `.pem` key file to the repository. Add it to `.gitignore`

## Prerequisites
- AWS account with EC2 instance running (Amazon Linux 2023)
- SSH key pair (.pem file) downloaded
- Security group configured to allow ports 22, 80, 443, and 3000

## Connecting to EC2 Instance

### 1. Set Key Permissions (First time only)
```bash
chmod 400 your-key-name.pem
```

### 2. Connect via SSH

ssh -i your-key-name.pem ec2-user@YOUR-PUBLIC-IP

Replace:

your-key-name.pem with your actual key file name
YOUR-PUBLIC-IP with your EC2 instance's public IP address

Example:

ssh -i when3meet-key.pem ec2-user@54.123.456.78

### 3. Verify Connection
Once connected, you should see a prompt like:
[ec2-user@ip-172-31-x-x ~]$

### 4. Exit Connection
To disconnect from the EC2 instance:
```bash
exit
```



