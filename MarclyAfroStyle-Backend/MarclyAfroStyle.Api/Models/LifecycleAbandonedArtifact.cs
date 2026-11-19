using System;
using System.Collections.Generic;

namespace MarclyAfroStyle.Api.Models;

public partial class LifecycleAbandonedArtifact
{
    public string BucketId { get; set; } = null!;

    public string Key { get; set; } = null!;

    public string Name { get; set; } = null!;

    public string? Version { get; set; }

    public DateTime AttemptedAt { get; set; }
}
