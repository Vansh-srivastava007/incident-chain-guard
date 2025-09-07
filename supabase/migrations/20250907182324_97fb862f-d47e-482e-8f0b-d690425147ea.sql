-- Add verification status field and update anchor status enum if needed
DO $$ 
BEGIN
    -- Add verification_status column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'incidents' AND column_name = 'verification_status') THEN
        ALTER TABLE incidents ADD COLUMN verification_status TEXT DEFAULT 'pending';
    END IF;
    
    -- Add verification_at timestamp if it doesn't exist  
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'incidents' AND column_name = 'verification_at') THEN
        ALTER TABLE incidents ADD COLUMN verification_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;