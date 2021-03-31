# Postgresql Database Setup

1. Install PostgreSQL
   1. For Ubuntu 20.04 [Digital Ocean Guide](https://www.digitalocean.com/community/tutorials/how-to-install-postgresql-on-ubuntu-20-04-quickstart)

2. Restore the data dump found at `datadump/finaldump.dump`. [More info](https://www.postgresql.org/docs/9.1/backup-dump.html)
   For example:
   ```
   sudo -i -u postgres  # you may have to do this first
   psql Ninecent_DB < finaldump.dump
   ```