import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription } from '../components/ui/alert';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { exportUserData, deleteUserAccount, getDataProcessingInfo } from '../services/api';

interface DataProcessingInfo {
  accountCreated: string;
  dataCategories: {
    profile: string;
    snippets: string;
    executions: string;
    comments: string;
    notifications: string;
    auditLogs: string;
  };
  dataRetention: {
    activeAccount: string;
    deletedAccount: string;
    backups: string;
  };
  dataSharing: {
    thirdParties: string;
    analytics: string;
    legal: string;
  };
  rights: {
    access: string;
    rectification: string;
    erasure: string;
    portability: string;
    restriction: string;
    objection: string;
  };
}

const PrivacyPage: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useToast();
  const { logout } = useAuth();
  const [dataInfo, setDataInfo] = useState<DataProcessingInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadDataProcessingInfo();
  }, []);

  const loadDataProcessingInfo = async () => {
    setLoading(true);
    try {
      const info = await getDataProcessingInfo();
      setDataInfo(info);
    } catch (error) {
      addToast('Failed to load data processing information', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setExporting(true);
    try {
      const data = await exportUserData();

      // Create and download JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      addToast('Data export completed successfully', 'success');
    } catch (error) {
      addToast('Failed to export data', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE_MY_ACCOUNT') {
      addToast('Please type the confirmation text exactly', 'error');
      return;
    }

    setDeleting(true);
    try {
      await deleteUserAccount(deleteConfirmation);
      addToast('Account deleted successfully', 'success');
      logout();
    } catch (error) {
      addToast('Failed to delete account', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Privacy & Data Rights</h1>
        <p className="text-gray-600">
          Manage your personal data and exercise your GDPR rights.
        </p>
      </div>

      {/* Data Processing Information */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Data Processing Information</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : dataInfo ? (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Account Information</h3>
                <p className="text-sm text-gray-600">
                  Account created: {new Date(dataInfo.accountCreated).toLocaleDateString()}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Data We Process</h3>
                <ul className="text-sm space-y-1">
                  <li>• {dataInfo.dataCategories.profile}</li>
                  <li>• {dataInfo.dataCategories.snippets}</li>
                  <li>• {dataInfo.dataCategories.executions}</li>
                  <li>• {dataInfo.dataCategories.comments}</li>
                  <li>• {dataInfo.dataCategories.notifications}</li>
                  <li>• {dataInfo.dataCategories.auditLogs}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Data Retention</h3>
                <ul className="text-sm space-y-1">
                  <li>• {dataInfo.dataRetention.activeAccount}</li>
                  <li>• {dataInfo.dataRetention.deletedAccount}</li>
                  <li>• {dataInfo.dataRetention.backups}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Data Sharing</h3>
                <ul className="text-sm space-y-1">
                  <li>• {dataInfo.dataSharing.thirdParties}</li>
                  <li>• {dataInfo.dataSharing.analytics}</li>
                  <li>• {dataInfo.dataSharing.legal}</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Your Rights</h3>
                <ul className="text-sm space-y-1">
                  <li>• {dataInfo.rights.access}</li>
                  <li>• {dataInfo.rights.rectification}</li>
                  <li>• {dataInfo.rights.erasure}</li>
                  <li>• {dataInfo.rights.portability}</li>
                  <li>• {dataInfo.rights.restriction}</li>
                  <li>• {dataInfo.rights.objection}</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              Failed to load data processing information
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Export Your Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Download a complete copy of all your personal data stored on our platform.
            This includes your profile, snippets, comments, execution history, and more.
          </p>
          <Button
            onClick={handleExportData}
            disabled={exporting}
            variant="outline"
          >
            {exporting ? 'Exporting...' : 'Export My Data'}
          </Button>
        </CardContent>
      </Card>

      {/* Account Deletion */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Delete Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              <strong>Warning:</strong> This action cannot be undone. Deleting your account will permanently
              remove all your data, including snippets, comments, and execution history.
            </AlertDescription>
          </Alert>

          {!showDeleteConfirm ? (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="destructive"
            >
              Delete My Account
            </Button>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="confirmation">
                  Type <strong>DELETE_MY_ACCOUNT</strong> to confirm:
                </Label>
                <Input
                  id="confirmation"
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="DELETE_MY_ACCOUNT"
                  className="mt-1"
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handleDeleteAccount}
                  disabled={deleting || deleteConfirmation !== 'DELETE_MY_ACCOUNT'}
                  variant="destructive"
                >
                  {deleting ? 'Deleting...' : 'Confirm Deletion'}
                </Button>
                <Button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmation('');
                  }}
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Privacy Policy Link */}
      <Card className="mt-6">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="font-semibold mb-2">Privacy Policy</h3>
            <p className="text-sm text-gray-600 mb-4">
              Read our complete privacy policy to understand how we collect, use, and protect your data.
            </p>
            <Button variant="link" asChild>
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
                View Privacy Policy
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrivacyPage;