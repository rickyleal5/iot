-- Config
ALTER SYSTEM SET shared_buffers = '1GB';
ALTER SYSTEM SET work_mem = '256MB';
ALTER SYSTEM SET max_connections = '100';
ALTER SYSTEM SET effective_io_concurrency = '500';
ALTER SYSTEM SET max_parallel_workers = '9';
ALTER SYSTEM SET max_worker_processes = '27';
ALTER SYSTEM SET max_parallel_workers_per_gather = '3';


-- Databases
CREATE DATABASE tsdb;

-- Grafana role
CREATE ROLE grafana WITH LOGIN PASSWORD 'password';

GRANT USAGE ON SCHEMA public TO grafana;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO grafana;

-- Sequelize role
CREATE ROLE sequelize WITH LOGIN SUPERUSER PASSWORD 'password';

GRANT USAGE ON SCHEMA public TO sequelize;

GRANT ALL PRIVILEGES ON DATABASE tsdb TO sequelize;
