import { PlanogramSection, DimensionObject, PlanogramElementId } from "../../planogram.types";
import { SECTION_ACTIONS, addSectionActionType, deleteSectionActionType, duplicateSectionActionType, addSectionActionProps, editSectionDimensionActionType, switchSectionsActionType, removeSectionItemsActionType } from "./section.types";
import { SectionDefaultDimension } from "../../planogram.defaults";

export function addSectionAction(aisle: PlanogramElementId, data: addSectionActionProps): addSectionActionType {
    return {
        type: SECTION_ACTIONS.ADD_SECTION,
        aisle,
        dimensions: SectionDefaultDimension,
        ...data
    }
}
export function duplicateSectionAction(aisle: PlanogramElementId, section: PlanogramSection): duplicateSectionActionType {
    return {
        type: SECTION_ACTIONS.DUPLICATE_SECTION,
        aisle,
        section
    }
}
export function switchSectionsAction(base: PlanogramSection, remote: PlanogramSection): switchSectionsActionType {
    return {
        type: SECTION_ACTIONS.SWITCH_SECTIONS,
        base,
        remote
    }
}
export function deleteSectionAction(aisle: PlanogramElementId, section: PlanogramSection): deleteSectionActionType {
    return {
        type: SECTION_ACTIONS.DELETE_SECTION,
        aisle,
        section
    }
}
export function removeSectionItemsAction(aisle: PlanogramElementId, section: PlanogramElementId): removeSectionItemsActionType {
    return {
        type: SECTION_ACTIONS.REMOVE_ITEMS,
        aisle,
        section
    }
}
export function editSectionDimensionAction(section: PlanogramSection, dimension: DimensionObject): editSectionDimensionActionType {
    return {
        type: SECTION_ACTIONS.EDIT_SECTION_DIMENSION,
        section,
        dimension
    }
}