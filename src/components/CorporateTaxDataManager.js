import { supabase } from './SupabaseClient';

/**
 * =================================================================
 * CORPORATE TAX ANALYSIS - COMPLETE DATA MANAGER
 * =================================================================
 * This module handles all database operations for corporate tax analysis
 */

export class CorporateTaxDataManager {
  constructor() {
    this.currentSessionId = null;
    this.userId = null;
  }

  // =================================================================
  // SESSION MANAGEMENT
  // =================================================================

  /**
   * Initialize a new analysis session
   */
  async initializeSession(userId) {
    try {
      this.userId = userId;

      // Generate session ID
      const { data: sessionData, error: sessionError } = await supabase
        .rpc('generate_session_id');

      if (sessionError) throw sessionError;

      const sessionId = sessionData;
      this.currentSessionId = sessionId;

      // Get browser info
      const browserInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };

      // Create session record
      const { data, error } = await supabase
        .from('corporate_tax_analysis_sessions')
        .insert([{
          session_id: sessionId,
          user_id: userId,
          current_step: 0,
          total_steps: 4,
          browser_info: browserInfo,
          user_inputs: {
            initialized_at: new Date().toISOString(),
            initial_step: 0
          }
        }])
        .select();

      if (error) throw error;

      console.log('Session initialized:', sessionId);
      return {
        sessionId: sessionId,
        sessionData: data[0]
      };

    } catch (error) {
      console.error('Error initializing session:', error);
      throw error;
    }
  }

  /**
   * Update session progress
   */
  async updateSessionProgress(step, stepData = {}) {
    try {
      if (!this.currentSessionId) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase
        .rpc('update_session_progress', {
          p_session_id: this.currentSessionId,
          p_step: step,
          p_step_data: stepData
        });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error updating session progress:', error);
      throw error;
    }
  }

  /**
   * Log session error
   */
  async logSessionError(errorMessage, errorData = {}) {
    try {
      if (!this.currentSessionId) return;

      await supabase
        .rpc('log_session_error', {
          p_session_id: this.currentSessionId,
          p_error_message: errorMessage,
          p_error_data: errorData
        });

    } catch (error) {
      console.error('Error logging session error:', error);
    }
  }

  /**
   * Get current session data
   */
  async getSessionData() {
    try {
      if (!this.currentSessionId) return null;

      const { data, error } = await supabase
        .from('corporate_tax_analysis_sessions')
        .select('*')
        .eq('session_id', this.currentSessionId)
        .single();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error getting session data:', error);
      return null;
    }
  }

  // =================================================================
  // DOCUMENT MANAGEMENT
  // =================================================================

  /**
   * Save uploaded document information
   */
  async saveUploadedDocument(fileData, documentType, filePath, storageUrl = null) {
    try {
      if (!this.currentSessionId || !this.userId) {
        throw new Error('No active session or user');
      }

      const documentData = {
        session_id: this.currentSessionId,
        user_id: this.userId,
        file_name: fileData.name,
        original_name: fileData.name,
        file_size: fileData.size,
        content_type: fileData.type,
        file_path: filePath,
        document_type: documentType,
        upload_status: 'uploaded',
        processing_status: 'pending',
        storage_url: storageUrl,
        metadata: {
          upload_timestamp: new Date().toISOString(),
          file_hash: await this.generateFileHash(fileData),
          source: 'user_upload'
        }
      };

      const { data, error } = await supabase
        .from('corporate_tax_uploaded_documents')
        .insert([documentData])
        .select();

      if (error) throw error;

      // Update session file count
      await this.updateSessionFileCount();

      console.log('Document saved:', data[0]);
      return data[0];

    } catch (error) {
      console.error('Error saving uploaded document:', error);
      throw error;
    }
  }

  /**
   * Save multiple documents from data room
   */
  async saveDataRoomDocuments(documents) {
    try {
      const savedDocuments = [];

      for (const doc of documents) {
        const documentData = {
          session_id: this.currentSessionId,
          user_id: this.userId,
          file_name: doc.file_name,
          original_name: doc.file_name,
          file_size: doc.file_size,
          content_type: doc.content_type,
          file_path: doc.file_path,
          document_type: 'financial_statement',
          upload_status: 'uploaded',
          processing_status: 'pending',
          metadata: {
            upload_timestamp: new Date().toISOString(),
            source: 'data_room',
            original_category: doc.category
          }
        };

        const { data, error } = await supabase
          .from('corporate_tax_uploaded_documents')
          .insert([documentData])
          .select();

        if (error) {
          console.error(`Error saving document ${doc.file_name}:`, error);
          continue;
        }

        savedDocuments.push(data[0]);
      }

      // Update session file count
      await this.updateSessionFileCount();

      return savedDocuments;
    } catch (error) {
      console.error('Error saving data room documents:', error);
      throw error;
    }
  }

  /**
   * Update document processing status
   */
  async updateDocumentProcessingStatus(documentId, processingStatus, extractedData = {}) {
    try {
      const { data, error } = await supabase
        .from('corporate_tax_uploaded_documents')
        .update({
          processing_status: processingStatus,
          extracted_data: extractedData,
          processed_at: new Date().toISOString()
        })
        .eq('id', documentId)
        .eq('user_id', this.userId)
        .select();

      if (error) throw error;
      return data[0];

    } catch (error) {
      console.error('Error updating document processing status:', error);
      throw error;
    }
  }

  /**
   * Get session documents
   */
  async getSessionDocuments() {
    try {
      if (!this.currentSessionId) return [];

      const { data, error } = await supabase
        .from('corporate_tax_uploaded_documents')
        .select('*')
        .eq('session_id', this.currentSessionId)
        .order('uploaded_at', { ascending: true });

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error getting session documents:', error);
      return [];
    }
  }

  // =================================================================
  // ANALYSIS DATA MANAGEMENT
  // =================================================================

  /**
   * Save complete corporate tax analysis
   */
  async saveCorporateTaxAnalysis(analysisData, processingTimeSeconds = 0) {
    try {
      if (!this.currentSessionId || !this.userId) {
        throw new Error('No active session or user');
      }

      const reportData = this.formatReportData(analysisData);
      
      // Prepare comprehensive data for database
      const dbData = {
        user_id: this.userId,
        session_id: this.currentSessionId,
        company_name: reportData.companyName,
        fiscal_year: reportData.fiscalYear,
        revenue: reportData.revenue,
        expenses: reportData.expenses,
        depreciation: reportData.depreciation,
        deductions: reportData.deductions,
        taxable_income: reportData.taxableIncome,
        tax_rate: reportData.taxRate,
        final_tax_owed: reportData.finalTaxOwed,
        documents: reportData.documents,
        observations: reportData.observations,
        recommendations: reportData.recommendations,
        raw_analysis_data: analysisData,
        status: 'completed',
        processing_time_seconds: processingTimeSeconds,
        completed_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('corporate_tax_analysis')
        .insert([dbData])
        .select();

      if (error) throw error;

      // Update session completion
      await this.updateSessionProgress(4, {
        analysis_completed: true,
        completion_timestamp: new Date().toISOString()
      });

      console.log('Analysis saved successfully:', data[0]);
      return data[0];

    } catch (error) {
      console.error('Error saving corporate tax analysis:', error);
      await this.logSessionError('Failed to save analysis', { error: error.message });
      throw error;
    }
  }

  /**
   * Get user's analysis history
   */
  async getUserAnalysisHistory(limit = 10) {
    try {
      if (!this.userId) return [];

      const { data, error } = await supabase
        .from('corporate_tax_analysis')
        .select(`
          id, session_id, company_name, fiscal_year, 
          revenue, expenses, taxable_income, final_tax_owed,
          status, created_at, completed_at
        `)
        .eq('user_id', this.userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error getting analysis history:', error);
      return [];
    }
  }

  /**
   * Get existing analysis by session
   */
  async getExistingAnalysis(sessionId = null) {
    try {
      const targetSessionId = sessionId || this.currentSessionId;
      if (!targetSessionId) return null;

      const { data, error } = await supabase
        .from('corporate_tax_analysis')
        .select('*')
        .eq('session_id', targetSessionId)
        .eq('user_id', this.userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;

    } catch (error) {
      console.error('Error getting existing analysis:', error);
      return null;
    }
  }

  /**
   * Delete analysis
   */
  async deleteAnalysis(analysisId) {
    try {
      const { error } = await supabase
        .from('corporate_tax_analysis')
        .delete()
        .eq('id', analysisId)
        .eq('user_id', this.userId);

      if (error) throw error;
      return true;

    } catch (error) {
      console.error('Error deleting analysis:', error);
      throw error;
    }
  }

  // =================================================================
  // UTILITY FUNCTIONS
  // =================================================================

  /**
   * Update session file count
   */
  async updateSessionFileCount() {
    try {
      if (!this.currentSessionId) return;

      const { count, error } = await supabase
        .from('corporate_tax_uploaded_documents')
        .select('*', { count: 'exact', head: true })
        .eq('session_id', this.currentSessionId);

      if (error) throw error;

      await supabase
        .from('corporate_tax_analysis_sessions')
        .update({ 
          uploaded_files_count: count,
          updated_at: new Date().toISOString()
        })
        .eq('session_id', this.currentSessionId);

    } catch (error) {
      console.error('Error updating session file count:', error);
    }
  }

  /**
   * Generate file hash for deduplication
   */
  async generateFileHash(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (error) {
      return `fallback_${Date.now()}_${Math.random()}`;
    }
  }

  /**
   * Format report data for storage
   */
  formatReportData(data) {
    const generalInfo = data.general_information || {};
    const companyName = generalInfo.company_name || 'Unknown Company';
    const fiscalYear = generalInfo.fiscal_year || new Date().getFullYear();
    
    const breakdown = data.tax_return_summary?.breakdown || {};
    const revenue = parseFloat(breakdown.Revenue || 0);
    const expenses = parseFloat(breakdown.Expenses || 0);
    const depreciation = parseFloat(breakdown.Depreciation || 0);
    const deductions = parseFloat(breakdown.Deductions || 0);
    const taxableIncome = parseFloat(breakdown['Taxable Income'] || 0);
    
    const taxRateString = breakdown['Applied Tax Rate'] || '0%';
    const taxRate = parseFloat(taxRateString.replace('%', '')) / 100;
    
    const finalTaxOwed = parseFloat(breakdown['Final Tax Owed'] || 0);
    
    const documents = (data.file_metadata || []).map(file => ({
      filename: file.filename,
      type: file.type,
      company_detected: file.company_name_detected,
      fiscal_year: file.fiscal_year_detected
    }));
    
    const observations = data.audit_flags || [];
    
    const recommendations = [];
    if (revenue === 0 && expenses > 0) {
      recommendations.push('Investigate why revenue is reported as $0 while expenses are significant.');
    }
    if (depreciation === 0) {
      recommendations.push('Review depreciation schedule for accuracy and completeness.');
    }
    if (documents.length > 0) {
      recommendations.push('Validate supporting documents for any missing or misclassified items.');
    }

    return {
      companyName,
      fiscalYear,
      revenue,
      expenses,
      depreciation,
      deductions,
      taxableIncome,
      taxRate,
      finalTaxOwed,
      documents,
      observations,
      recommendations
    };
  }

  /**
   * Clean up expired sessions (utility function)
   */
  async cleanupExpiredSessions() {
    try {
      const { error } = await supabase
        .from('corporate_tax_analysis_sessions')
        .delete()
        .lt('expires_at', new Date().toISOString());

      if (error) throw error;

    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
    }
  }

  // =================================================================
  // REPORTING FUNCTIONS
  // =================================================================

  /**
   * Get analysis statistics for user
   */
  async getAnalysisStatistics() {
    try {
      if (!this.userId) return null;

      const { data, error } = await supabase
        .from('corporate_tax_analysis')
        .select(`
          id, fiscal_year, revenue, final_tax_owed, 
          created_at, status
        `)
        .eq('user_id', this.userId)
        .eq('status', 'completed');

      if (error) throw error;

      const stats = {
        totalAnalyses: data.length,
        totalRevenue: data.reduce((sum, item) => sum + (item.revenue || 0), 0),
        totalTaxOwed: data.reduce((sum, item) => sum + (item.final_tax_owed || 0), 0),
        averageTaxRate: 0,
        recentAnalyses: data.slice(0, 5),
        yearlyBreakdown: {}
      };

      // Calculate yearly breakdown
      data.forEach(item => {
        const year = item.fiscal_year;
        if (!stats.yearlyBreakdown[year]) {
          stats.yearlyBreakdown[year] = {
            count: 0,
            totalRevenue: 0,
            totalTaxOwed: 0
          };
        }
        stats.yearlyBreakdown[year].count++;
        stats.yearlyBreakdown[year].totalRevenue += item.revenue || 0;
        stats.yearlyBreakdown[year].totalTaxOwed += item.final_tax_owed || 0;
      });

      // Calculate average tax rate
      if (stats.totalRevenue > 0) {
        stats.averageTaxRate = (stats.totalTaxOwed / stats.totalRevenue) * 100;
      }

      return stats;

    } catch (error) {
      console.error('Error getting analysis statistics:', error);
      return null;
    }
  }
}

// Export singleton instance
export const corporateTaxDataManager = new CorporateTaxDataManager();
export default corporateTaxDataManager; 