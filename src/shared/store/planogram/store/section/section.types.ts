import { DimensionObject, PlanogramSection, PlanogramItem, PlanogramShelf, PlanogramElementId } from "../../planogram.types";
import { CatalogBarcode } from "shared/interfaces/models/CatalogProduct";

export enum SECTION_ACTIONS {
    ADD_SECTION = "ADD_SECTION",
    DELETE_SECTION = "DELETE_SECTION",
    DUPLICATE_SECTION = "DUPLICATE_SECTION",
    EDIT_SECTION_DIMENSION = "EDIT_SECTION_DIMENSION",
    SWITCH_SECTIONS = "SWITCH_SECTIONS",
    REMOVE_ITEMS = "REMOVE_ITEMS"
}

export type addSectionActionProps = {
    dimensions?: DimensionObject,
    section?: PlanogramSection
    item?: PlanogramItem,
    product?: CatalogBarcode,
    shelf?: PlanogramShelf
};
export type addSectionActionType = {
    type: SECTION_ACTIONS.ADD_SECTION,
    dimensions?: DimensionObject,
    aisle: PlanogramElementId,
    product?: CatalogBarcode,
    item?: PlanogramItem,
    shelf?: PlanogramShelf,
    section?: PlanogramSection,
};
export type deleteSectionActionType = {
    type: SECTION_ACTIONS.DELETE_SECTION,
    aisle: PlanogramElementId,
    section: PlanogramSection
};
export type removeSectionItemsActionType = {
    type: SECTION_ACTIONS.REMOVE_ITEMS,
    section: PlanogramElementId,
    aisle: PlanogramElementId
};
export type switchSectionsActionType = {
    type: SECTION_ACTIONS.SWITCH_SECTIONS,
    base: PlanogramSection,
    remote: PlanogramSection
};
export type duplicateSectionActionType = {
    type: SECTION_ACTIONS.DUPLICATE_SECTION,
    aisle: PlanogramElementId,
    section: PlanogramSection
};
export type editSectionDimensionActionType = {
    type: SECTION_ACTIONS.EDIT_SECTION_DIMENSION,
    section: PlanogramSection,
    dimension: DimensionObject,
};


export type SectionActionTypes = editSectionDimensionActionType |
    addSectionActionType |
    removeSectionItemsActionType |
    switchSectionsActionType |
    deleteSectionActionType |
    duplicateSectionActionType;