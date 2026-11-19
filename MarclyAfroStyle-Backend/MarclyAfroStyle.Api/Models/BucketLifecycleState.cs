using System;
using System.Collections.Generic;

namespace MarclyAfroStyle.Api.Models;

public partial class BucketLifecycleState
{
    public string BucketId { get; set; } = null!;

    public Guid? Generation { get; set; }

    public DateTime? NextRunAt { get; set; }

    public Guid? ClaimId { get; set; }

    public DateTime? ClaimUntil { get; set; }

    public string? Continuation { get; set; }

    public DateTime? LastStartedAt { get; set; }

    public DateTime? LastCompletedAt { get; set; }

    public DateTime? LastSuccessAt { get; set; }

    public string? LastResult { get; set; }

    public int FailureCount { get; set; }

    public string? LastError { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual Bucket Bucket { get; set; } = null!;
}
