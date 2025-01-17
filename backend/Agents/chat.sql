-- Create user_chat table to store chat interactions
CREATE TABLE IF NOT EXISTS user_chat (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    saved_to_memory BOOLEAN DEFAULT false,
    memory_file_path TEXT
);

-- Create index on timestamp for efficient querying
CREATE INDEX IF NOT EXISTS idx_user_chat_timestamp ON user_chat(timestamp);

-- Create index on role for filtering
CREATE INDEX IF NOT EXISTS idx_user_chat_role ON user_chat(role);

-- Create function to update memory file path
CREATE OR REPLACE FUNCTION update_memory_file_path()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.saved_to_memory = true AND NEW.memory_file_path IS NULL THEN
        NEW.memory_file_path := 'Docs/Memory/mem_' || to_char(NEW.timestamp, 'YYYY_MM_DD_HH24_MI_SS') || '.md';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update memory file path
CREATE TRIGGER set_memory_file_path
    BEFORE INSERT OR UPDATE ON user_chat
    FOR EACH ROW
    EXECUTE FUNCTION update_memory_file_path();

-- Create RLS policies
ALTER TABLE user_chat ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view chat history
CREATE POLICY "Allow viewing chat history"
    ON user_chat FOR SELECT
    TO authenticated
    USING (true);

-- Allow all authenticated users to insert new chat messages
CREATE POLICY "Allow inserting chat messages"
    ON user_chat FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow updating only saved_to_memory and memory_file_path fields
CREATE POLICY "Allow updating save status"
    ON user_chat FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Create trigger to prevent updating certain fields
CREATE OR REPLACE FUNCTION prevent_content_updates()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.role != NEW.role OR 
       OLD.content != NEW.content OR 
       OLD.timestamp != NEW.timestamp THEN
        RAISE EXCEPTION 'Cannot modify role, content, or timestamp';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_immutable_fields
    BEFORE UPDATE ON user_chat
    FOR EACH ROW
    EXECUTE FUNCTION prevent_content_updates();
