-- One-time compatibility migration for sharing_type.
-- Older databases may still have this as ENUM('DOUBLE','TRIPLE').
-- Use VARCHAR so new enum constants (e.g., FOUR) do not break writes.
SET @sharing_type_migration_sql = (
        SELECT IF(
                EXISTS (
                    SELECT 1
                    FROM information_schema.tables
                    WHERE table_schema = DATABASE()
                        AND table_name = 'postings'
                ),
                'ALTER TABLE postings MODIFY COLUMN sharing_type VARCHAR(20) NOT NULL',
                'SELECT 1'
            )
    );
PREPARE sharing_type_stmt
FROM @sharing_type_migration_sql;
EXECUTE sharing_type_stmt;
DEALLOCATE PREPARE sharing_type_stmt;