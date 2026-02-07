"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, User, GitBranch } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface VersionManagerProps {
  projectId: Id<"projects">;
  isOwner: boolean;
}

interface Version {
  _id: Id<"componentVersions">;
  _creationTime: number;
  projectId: Id<"projects">;
  componentName: string;
  componentCode: string;
  createdBy: Id<"users">;
  createdAt: number;
  version: number;
  isApproved: boolean;
  approvedBy?: Id<"users">;
  approvedAt?: number;
  description?: string;
}

interface VersionWithDetails extends Version {
  creator: { name?: string; email?: string };
  approver: { name?: string; email?: string } | null;
}

interface ChangeRequest {
  _id: Id<"changeRequests">;
  _creationTime: number;
  projectId: Id<"projects">;
  componentName: string;
  currentVersionId?: Id<"componentVersions">;
  proposedVersionId: Id<"componentVersions">;
  requestedBy: Id<"users">;
  requestedAt: number;
  status: "pending" | "approved" | "rejected";
  reviewedBy?: Id<"users">;
  reviewedAt?: number;
  reviewComments?: string;
  linesAdded: number;
  linesRemoved: number;
}

interface ChangeRequestWithDetails extends ChangeRequest {
  requester: { name?: string; email?: string };
  proposedVersion: Version | null;
  currentVersion: Version | null;
}

interface CreateVersionDialogProps {
  projectId: Id<"projects">;
  isOwner: boolean;
  initialCode?: string;
  children?: React.ReactNode;
  onSuccess?: (code: string, name: string, description: string) => void;
  initialComponentName?: string;
  initialDescription?: string;
}

// Calculate diff stats (simple line count)
const calculateDiff = (oldCode: string, newCode: string) => {
  const oldLines = oldCode.split("\n");
  const newLines = newCode.split("\n");
  const linesAdded = Math.max(0, newLines.length - oldLines.length);
  const linesRemoved = Math.max(0, oldLines.length - newLines.length);
  return { linesAdded, linesRemoved };
};

export function CreateVersionDialog({ projectId, isOwner, initialCode = "", children, onSuccess, initialComponentName = "", initialDescription = "" }: CreateVersionDialogProps) {
  const [componentName, setComponentName] = useState(initialComponentName);
  const [componentCode, setComponentCode] = useState(initialCode);
  const [description, setDescription] = useState(initialDescription);
  const [open, setOpen] = useState(false);

  const createVersion = useMutation(api.versions.createVersion);
  const createChangeRequest = useMutation(api.versions.createChangeRequest);
  
  // Need to fetch current versions to calculate diff if not owner
  const versions = useQuery(
      api.versions.getComponentVersions,
      componentName ? { projectId, componentName } : "skip"
    ) as VersionWithDetails[] | undefined;

  // Fetch existing component names for autocomplete
  const existingComponents = useQuery(api.versions.getAllComponents, { projectId });

  const handleSubmit = async () => {
    if (!componentName.trim() || !componentCode.trim()) {
      toast.error("Component name and code are required");
      return;
    }

    try {
      // Create version
      const versionId = await createVersion({
        projectId,
        componentName: componentName.trim(),
        componentCode: componentCode.trim(),
        description: description.trim() || undefined,
      });

      // If not owner, create change request
      if (!isOwner) {
        const currentVersion = versions?.find((v) => v.isApproved);
        
        // Calculate diff or set as new
        let linesAdded = 0;
        let linesRemoved = 0;

        if (currentVersion) {
          const diff = calculateDiff(
            currentVersion.componentCode,
            componentCode.trim()
          );
          linesAdded = diff.linesAdded;
          linesRemoved = diff.linesRemoved;
        } else {
          // New component: all lines added
          linesAdded = componentCode.trim().split('\n').length;
          linesRemoved = 0;
        }

        await createChangeRequest({
          projectId,
          componentName: componentName.trim(),
          currentVersionId: currentVersion?._id,
          proposedVersionId: versionId,
          linesAdded,
          linesRemoved,
        });
      }

      toast.success(isOwner ? "Version created!" : "Change request submitted!");
      
      // Auto-save callback
      if (onSuccess) {
        onSuccess(componentCode.trim(), componentName.trim(), description.trim());
      }

      setOpen(false);
      setComponentName("");
      
      // If no initial code was passed, clear it, otherwise keep it or reset to initial?
      // Resetting to initial seems safer for reusable dialogs, but if it came from props, it might persist.
      // For this use case (from card), we probably want to close dialog and that's it.
      if (!initialCode) setComponentCode("");
      setDescription("");

    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit";
      toast.error(message);
      console.error("Version creation error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{isOwner ? "Create Version" : "Submit Change Request"}</DialogTitle>
          <DialogDescription>
            Submit this component code for review or versioning.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Component Name</label>
            <Input
              placeholder="Select existing or type new name..."
              value={componentName}
              onChange={(e) => setComponentName(e.target.value)}
              list="component-names"
              autoComplete="off"
            />
            <datalist id="component-names">
              {existingComponents?.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
            <p className="text-xs text-muted-foreground mt-1">
              Select an existing component to update it (v2, v3...), or type a new name to create v1.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Input
              placeholder="What does this component do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {!initialCode && (
            <div>
              <label className="text-sm font-medium mb-2 block">Component Code</label>
              <Textarea
                placeholder="Paste your code here..."
                value={componentCode}
                onChange={(e) => setComponentCode(e.target.value)}
                className="font-mono min-h-[300px]"
              />
            </div>
          )}

          <Button onClick={handleSubmit} className="w-full">
            {isOwner ? "Create & Auto-Approve" : "Submit for Review"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function VersionManager({ projectId, isOwner }: VersionManagerProps) {
  const [componentName, setComponentName] = useState("");
  const [componentCode, setComponentCode] = useState("");
  const [description, setDescription] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<Id<"changeRequests"> | null>(null);
  const [reviewComment, setReviewComment] = useState("");

  // Queries
  const versions = useQuery(
    api.versions.getComponentVersions,
    { projectId, componentName: componentName || undefined }
  ) as VersionWithDetails[] | undefined;

  const rejectedRequests = useQuery(
    api.versions.getRejectedChangeRequests,
    { projectId, componentName: componentName || undefined }
  ) as ChangeRequestWithDetails[] | undefined;

  const pendingRequests = useQuery(api.versions.getPendingChangeRequests, { projectId }) as ChangeRequestWithDetails[] | undefined;
  
  const requestDetails = useQuery(
    api.versions.getChangeRequestDetails,
    selectedRequest ? { changeRequestId: selectedRequest } : "skip"
  ) as ChangeRequestWithDetails | null | undefined;

  // Mutations
  const createVersion = useMutation(api.versions.createVersion);
  const createChangeRequest = useMutation(api.versions.createChangeRequest);
  const approveRequest = useMutation(api.versions.approveChangeRequest);
  const rejectRequest = useMutation(api.versions.rejectChangeRequest);

 
  const handleCreateVersion = async () => {
    if (!componentName.trim() || !componentCode.trim()) {
      toast.error("Component name and code are required");
      return;
    }

    try {
      // Create version
      const versionId = await createVersion({
        projectId,
        componentName: componentName.trim(),
        componentCode: componentCode.trim(),
        description: description.trim() || undefined,
      });

      // If not owner, create change request
      if (!isOwner) {
        const currentVersion = versions?.find((v) => v.isApproved);
        
        // Calculate diff or set as new
        let linesAdded = 0;
        let linesRemoved = 0;

        if (currentVersion) {
          const diff = calculateDiff(
            currentVersion.componentCode,
            componentCode.trim()
          );
          linesAdded = diff.linesAdded;
          linesRemoved = diff.linesRemoved;
        } else {
          // New component: all lines added
          linesAdded = componentCode.trim().split('\n').length;
          linesRemoved = 0;
        }

        await createChangeRequest({
          projectId,
          componentName: componentName.trim(),
          currentVersionId: currentVersion?._id,
          proposedVersionId: versionId,
          linesAdded,
          linesRemoved,
        });
      }

      toast.success(isOwner ? "Version created!" : "Change request submitted!");
      setComponentCode("");
      setDescription("");
    } catch (error) {
      toast.error("Failed to create version");
      console.error(error);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    try {
      await approveRequest({
        changeRequestId: selectedRequest as Id<"changeRequests">,
        comments: reviewComment || undefined,
      });
      toast.success("Change approved!");
      setSelectedRequest(null);
      setReviewComment("");
    } catch (error) {
      toast.error("Failed to approve");
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !reviewComment.trim()) {
      toast.error("Please provide a reason");
      return;
    }
    try {
      await rejectRequest({
        changeRequestId: selectedRequest as Id<"changeRequests">,
        comments: reviewComment,
      });
      toast.success("Change rejected");
      setSelectedRequest(null);
      setReviewComment("");
    } catch (error) {
      toast.error("Failed to reject");
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pending">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pending">
            <Clock className="h-4 w-4 mr-2" />
            Pending ({pendingRequests?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="history">
            <GitBranch className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>

        </TabsList>

        {/* Pending Reviews */}
        <TabsContent value="pending" className="space-y-4">
          {!isOwner ? (
            <Card className="p-6 text-center text-muted-foreground">
              Only owners can review changes
            </Card>
          ) : pendingRequests?.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              <p>No pending reviews.</p>
              <p className="text-xs mt-2">
                (As the owner, your changes are auto-approved and appear in the History tab)
              </p>
            </Card>
          ) : (
            <>
              {!selectedRequest ? (
                <div className="space-y-3">
                  {pendingRequests?.map((req) => (
                    <Card
                      key={req._id}
                      className="p-4 cursor-pointer hover:border-sidebar-accent transition-all group"
                      onClick={() => setSelectedRequest(req._id)}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {req.componentName}
                            </span>
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] px-1.5 py-0 font-mono">
                              +{req.linesAdded}
                            </Badge>
                            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] px-1.5 py-0 font-mono">
                              -{req.linesRemoved}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {formatDistanceToNow(req.requestedAt, { addSuffix: true })}
                          </span>
                        </div>

                        {req.proposedVersion?.description && (
                          <p className="text-sm text-muted-foreground/80 line-clamp-2">
                            {req.proposedVersion.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>by {req.requester.name || req.requester.email}</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">
                      {requestDetails?.componentName}
                    </h2>
                    <Button variant="ghost" onClick={() => setSelectedRequest(null)}>
                      Back
                    </Button>
                  </div>

                  {requestDetails?.proposedVersion?.description && (
                    <p className="text-muted-foreground">
                      {requestDetails.proposedVersion.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold mb-2">Current Version</h3>
                      <pre className="bg-muted p-4 rounded text-xs overflow-x-auto max-h-96">
                        {requestDetails?.currentVersion?.componentCode || "New component"}
                      </pre>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Proposed Version</h3>
                      <pre className="bg-muted p-4 rounded text-xs overflow-x-auto max-h-96">
                        {requestDetails?.proposedVersion?.componentCode}
                      </pre>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Textarea
                      placeholder="Add review comments..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex gap-3">
                      <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button onClick={handleReject} variant="destructive">
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Version History */}
        <TabsContent value="history" className="space-y-4">
          <Input
            placeholder="Enter component name..."
            value={componentName}
            onChange={(e) => setComponentName(e.target.value)}
          />

          {versions?.length === 0 ? (
            <Card className="p-6 text-center text-muted-foreground">
              No versions found
            </Card>
          ) : (
            <div className="space-y-3">
              {[
                ...(versions || []).map(v => ({ ...v, type: 'version' as const })),
                ...(rejectedRequests || []).map(r => ({ ...r, type: 'rejected' as const }))
              ]
              .sort((a, b) => {
                const timeA = a.type === 'version' ? a.createdAt : (a.reviewedAt || a.requestedAt);
                const timeB = b.type === 'version' ? b.createdAt : (b.reviewedAt || b.requestedAt);
                return timeB - timeA;
              })
              .map((item) => (
                <Card
                  key={item._id}
                  className="p-4 hover:border-sidebar-accent transition-colors group"
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.type === 'version' ? (
                          <Badge variant="secondary" className="font-mono text-xs">
                            v{item.version}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="font-mono text-xs">
                            {item.proposedVersion ? `v${item.proposedVersion.version}` : 'CR'}
                          </Badge>
                        )}
                        
                        <span className="font-medium text-sm">
                          {item.componentName}
                        </span>

                        {item.type === 'version' && item.isApproved && (
                          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-[10px] px-1.5 py-0">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approved
                          </Badge>
                        )}
                        
                        {item.type === 'rejected' && (
                          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 text-[10px] px-1.5 py-0 font-mono">
                            <XCircle className="h-3 w-3 mr-1" />
                            Rejected
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {formatDistanceToNow(
                          item.type === 'version' ? item.createdAt : (item.reviewedAt || item.requestedAt), 
                          { addSuffix: true }
                        )}
                      </span>
                    </div>

                    {((item.type === 'version' && item.description) || (item.type === 'rejected' && item.reviewComments)) && (
                      <p className="text-sm text-muted-foreground/80 line-clamp-2">
                        {item.type === 'version' ? item.description : item.reviewComments}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        {item.type === 'version' ? (
                          <span>{item.creator.name || item.creator.email}</span>
                        ) : (
                          <span>
                            Req by {item.requester.name || item.requester.email} 
                            {item.reviewedBy && ` • Rejected by Owner`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}   
        </TabsContent>
      </Tabs>
    </div>
  );
}