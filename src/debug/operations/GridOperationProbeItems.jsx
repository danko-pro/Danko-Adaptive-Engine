import { formatItemLabel } from "../../../engine-adapter/index.js";
import { ItemActionMenu } from "./ItemActionMenu.jsx";
import { isSelectedItem } from "./operationProbeUtils.js";
import { ResizeHandles } from "./ResizeHandles.jsx";

export function GridOperationProbeItems({
  items,
  selection,
  compositionPlan,
  showCompositionOverlay,
  menuTargetId,
  menuMode,
  renameValue,
  onStartMove,
  onStartResize,
  onOpenMenu,
  onCloseMenu,
  onCopyItem,
  onDeleteItem,
  onRenameItem,
  onStartRenameItem,
  onUpdateRenameValue,
  onPointerMove,
  onPointerUp
}) {
  const compositionInfoById = createCompositionInfoById(compositionPlan);

  return (
    <>
      {items.map((item) => {
        const compositionInfo = compositionInfoById.get(String(item.id));

        return (
          <div
            className={getItemClassName(item, selection)}
            key={item.id}
            style={{
              gridColumn: `${item.x} / span ${item.w}`,
              gridRow: `${item.y} / span ${item.h}`
            }}
            tabIndex={isSelectedItem(selection, item) ? 0 : -1}
            onPointerDown={(event) => onStartMove(event, item)}
            onDoubleClick={(event) => onOpenMenu(event, item)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && isSelectedItem(selection, item)) {
                onOpenMenu(event, item);
              }
            }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <span className="grid-operation-probe-label">{formatItemLabel(item)}</span>
            {showCompositionOverlay && compositionInfo && (
              <GridOperationCompositionBadge info={compositionInfo} />
            )}
            {String(menuTargetId) === String(item.id) && (
              <ItemActionMenu
                item={item}
                mode={menuMode}
                renameValue={renameValue}
                onClose={onCloseMenu}
                onCopy={onCopyItem}
                onDelete={onDeleteItem}
                onRename={onRenameItem}
                onStartRename={onStartRenameItem}
                onUpdateRenameValue={onUpdateRenameValue}
              />
            )}
            {isSelectedItem(selection, item) && (
              <ResizeHandles item={item} onPointerDown={onStartResize} />
            )}
          </div>
        );
      })}
    </>
  );
}

function GridOperationCompositionBadge({ info }) {
  return (
    <div
      className="grid-operation-composition-badge"
      aria-label="V2 информация блока"
      title={info.details}
    >
      <strong>{info.shortType}</strong>
      <small>{info.shortPosition}</small>
      {info.shortGroup && <small>{info.shortGroup}</small>}
      {info.shortAnchors && <small>{info.shortAnchors}</small>}
    </div>
  );
}

function getItemClassName(item, selection) {
  const classes = [
    "grid-operation-probe-item",
    `is-block-type-${normalizeBlockType(item.meta?.blockType)}`
  ];

  if (isSelectedItem(selection, item)) {
    classes.push("is-selected");
  }

  return classes.join(" ");
}

function normalizeBlockType(value) {
  return String(value || "unknown").trim() || "unknown";
}

function createCompositionInfoById(plan) {
  const result = new Map();

  if (!plan || !Array.isArray(plan.blocks)) {
    return result;
  }

  for (const block of plan.blocks) {
    const groupId = resolveGroupId(plan.groups, block.id);
    const recommendation = formatRecommendation(plan, block.id);

    result.set(String(block.id), {
      type: String(block.contentSchema?.type ?? "unknown"),
      shortType: formatShortType(block.contentSchema?.type),
      position: formatWorkspacePosition(block.workspacePosition),
      shortPosition: formatShortWorkspacePosition(block.workspacePosition),
      groupId,
      shortGroup: formatShortGroup(groupId),
      anchors: formatAnchors(block),
      shortAnchors: formatShortAnchors(block),
      relation: formatRelation(plan.relations, block.id),
      recommendation,
      details: formatCompositionDetails({
        type: String(block.contentSchema?.type ?? "unknown"),
        position: formatWorkspacePosition(block.workspacePosition),
        groupId,
        anchors: formatAnchors(block),
        relation: formatRelation(plan.relations, block.id),
        recommendation
      })
    });
  }

  return result;
}

function formatWorkspacePosition(position) {
  if (!position) {
    return "zone: unknown";
  }

  return `${position.horizontal ?? "?"} / ${position.vertical ?? "?"}`;
}

function formatShortType(value) {
  const type = String(value ?? "unknown");
  const names = {
    header: "head",
    content: "content",
    sidebar: "side",
    control: "ctrl",
    warning: "warn",
    unknown: "unknown"
  };

  return names[type] ?? type;
}

function formatShortWorkspacePosition(position) {
  if (!position) {
    return "?/?";
  }

  return `${shortZone(position.horizontal)}/${shortZone(position.vertical)}`;
}

function shortZone(value) {
  const zone = String(value ?? "?");
  const names = {
    left: "L",
    center: "C",
    right: "R",
    top: "T",
    middle: "M",
    bottom: "B"
  };

  return names[zone] ?? "?";
}

function resolveGroupId(groups, blockId) {
  const group = Array.isArray(groups)
    ? groups.find((item) => item.blockIds?.map(String).includes(String(blockId)))
    : null;

  return group?.id ?? null;
}

function formatShortGroup(groupId) {
  if (!groupId) {
    return "";
  }

  const match = String(groupId).match(/\d+$/);
  return match ? `G${match[0]}` : String(groupId);
}

function formatAnchors(block) {
  const anchors = [];

  if (block.edges?.fullWidth) {
    anchors.push("full");
  } else {
    if (block.edges?.left) {
      anchors.push("L");
    }

    if (block.edges?.right) {
      anchors.push("R");
    }
  }

  if (block.edges?.top) {
    anchors.push("T");
  }

  if (block.edges?.bottom) {
    anchors.push("B");
  }

  return anchors.length > 0 ? `anchor: ${anchors.join("+")}` : "";
}

function formatShortAnchors(block) {
  const anchors = [];

  if (block.edges?.fullWidth) {
    anchors.push("full");
  } else {
    if (block.edges?.left) {
      anchors.push("L");
    }

    if (block.edges?.right) {
      anchors.push("R");
    }
  }

  if (block.edges?.top) {
    anchors.push("T");
  }

  if (block.edges?.bottom) {
    anchors.push("B");
  }

  return anchors.join("+");
}

function formatRelation(relations, blockId) {
  if (!Array.isArray(relations)) {
    return "";
  }

  const relation = relations.find((item) => (
    String(item.sourceId) === String(blockId) ||
    String(item.targetId) === String(blockId)
  ));

  if (!relation) {
    return "";
  }

  const pairId = String(relation.sourceId) === String(blockId)
    ? relation.targetId
    : relation.sourceId;

  return pairId ? `link: ${pairId}` : relation.type;
}

function formatCompositionDetails(info) {
  return [
    `тип: ${info.type}`,
    `позиция: ${info.position}`,
    info.groupId ? `группа: ${info.groupId}` : "",
    info.anchors ? `привязка: ${info.anchors}` : "",
    info.relation ? `связь: ${info.relation}` : "",
    info.recommendation ? `V2: ${info.recommendation}` : ""
  ].filter(Boolean).join("\n");
}

function formatRecommendation(plan, blockId) {
  const issue = Array.isArray(plan.issues)
    ? plan.issues.find((item) => String(item.blockId) === String(blockId))
    : null;
  const proposal = Array.isArray(plan.proposals)
    ? plan.proposals.find((item) => String(item.blockId) === String(blockId))
    : null;

  if (proposal?.message) {
    return proposal.message;
  }

  if (issue?.message) {
    return issue.message;
  }

  return "Сохранить роль и место в композиции.";
}
