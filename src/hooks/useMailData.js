import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Ensure this path is correct

export const useMailData = () => {
  const [mailData, setMailData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMailData();
  }, []);

  const fetchMailData = async () => {
    try {
      const { data, error } = await supabase
        .from('document_uploads')
        .select(`
          client_id,
          document_name, 
          document_type,
          created_at,
          file_path
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Format the data
      const formattedData = data.map(item => ({
        id: item.uuid,
        sender: item.document_name.split('-')[0], // Assuming document name contains sender info
        subject: item.document_name,
        status: item.document_type,
        date: new Date(item.created_at).toLocaleDateString(),
        storagePath: item.storage_path,
        tags: []
      }));

      setMailData(formattedData);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { mailData, loading, error };
};