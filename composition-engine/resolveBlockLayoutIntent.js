import { COMPOSITION_LAYOUT_INTENTS } from "./contracts/compositionLayoutIntents.js";

export function resolveBlockLayoutIntent(block) {
  const type = String(block.contentSchema?.type ?? "unknown");

  if (type === "header") {
    return createIntent({
      type: COMPOSITION_LAYOUT_INTENTS.PRESERVE_TOP_WIDTH,
      priority: "high",
      anchors: ["top", "left", "right"],
      canWrap: false,
      message: "Header должен сохранять верхнюю роль и привязку к ширине рабочей области."
    });
  }

  if (type === "content") {
    return createIntent({
      type: COMPOSITION_LAYOUT_INTENTS.PRIORITIZE_CONTENT,
      priority: "high",
      anchors: ["center"],
      canWrap: true,
      message: "Content должен оставаться главным смысловым блоком композиции."
    });
  }

  if (type === "sidebar") {
    return createIntent({
      type: COMPOSITION_LAYOUT_INTENTS.PRESERVE_SIDE_ROLE,
      priority: "medium",
      anchors: ["left-or-right"],
      canWrap: true,
      message: "Sidebar сохраняет боковую роль, но может переноситься при нехватке ширины."
    });
  }

  if (type === "control") {
    return createIntent({
      type: COMPOSITION_LAYOUT_INTENTS.KEEP_CONTROL_CONTEXT,
      priority: "medium",
      anchors: ["near-related-block"],
      canWrap: true,
      message: "Control должен оставаться рядом с областью, которой управляет."
    });
  }

  if (type === "warning") {
    return createIntent({
      type: COMPOSITION_LAYOUT_INTENTS.KEEP_WARNING_VISIBLE,
      priority: "high",
      anchors: ["visible"],
      canWrap: true,
      message: "Warning должен оставаться заметным и не перекрывать основной content."
    });
  }

  return createIntent({
    type: COMPOSITION_LAYOUT_INTENTS.DESCRIBE_BEHAVIOR,
    priority: "low",
    anchors: [],
    canWrap: true,
    message: "Для блока нужно описать ожидаемое поведение при адаптации."
  });
}

function createIntent({ type, priority, anchors, canWrap, message }) {
  return {
    type,
    priority,
    anchors,
    canWrap,
    message
  };
}
