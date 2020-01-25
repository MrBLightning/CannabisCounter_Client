import { STORE_ACTIONS } from "./store.types";
import { PlanogramActions, PlanogramStore, PlacementObject, PlanogramElementId, PlanogramItem } from "../planogram.types";
import { aisleReducer } from "./aisle/aisle.reducers";
import { AISLE_ACTIONS } from "./aisle/aisle.types";
import { SECTION_ACTIONS } from "./section/section.types";
import { SHELF_ACTIONS } from "./shelf/shelf.types";
import { ITEM_ACTIONS } from "./item/item.types";
import { PLANOGRAM_ID, ItemDefualtPlacement, ItemMaxPlacement, ProductDefaultDimensions } from "../planogram.defaults";
import { shelfDetailsReducer, shelfMapReducer } from "../virtualize/virtualize.reducer";
import { AppState } from "shared/store/app.reducer";
import { CatalogMap } from "shared/store/catalog/catalog.types";

export function validatePlacementObject(obj: PlacementObject): PlacementObject {
  return {
    faces: obj.faces <= 0 ? ItemDefualtPlacement.faces : (obj.faces > ItemMaxPlacement.faces ? ItemMaxPlacement.faces : obj.faces),
    stack: obj.stack <= 0 ? ItemDefualtPlacement.stack : (obj.stack > ItemMaxPlacement.stack ? ItemMaxPlacement.stack : obj.stack),
    row: obj.row <= 0 ? ItemDefualtPlacement.row : (obj.row > ItemMaxPlacement.row ? ItemMaxPlacement.row : obj.row),
    manual_row_only: obj.manual_row_only > 0 ? 1 : 0,
  }
}

function fixStoreShelfItems(store: PlanogramStore, catalogMap: CatalogMap): PlanogramStore {
  const shelfDetails = shelfDetailsReducer(store);
  const shelfMap = shelfMapReducer(store);

  const shelfItemsMap: { [key: string]: PlanogramItem[] } = {}
  const sh_w: { [key: string]: number } = {}
  const item_placed = new Set<PlanogramElementId>();

  for (const aisle of store.aisles) {

    for (const section of aisle.sections) {
      for (const shelf of section.shelves) {
        const shelfId = shelf.id;
        const shelfItems = [...(shelfItemsMap[shelfId] || []), ...shelf.items];
        const { width: shelfWidth, height: shelfHeight } = shelf.dimensions;
        const { combined, main_shelf } = shelfDetails[shelfId];

        if (sh_w[shelfId] == null)
          sh_w[shelfId] = 0;
        if (!shelfItemsMap[shelfId])
          shelfItemsMap[shelfId] = [];

        for (const item of shelfItems) {
          const product = catalogMap[item.product];
          const productWidth = ((product && product.width) || ProductDefaultDimensions.width);
          let itemShelfId = shelfId;

          let item_sh_i = 0;

          while (item_sh_i < combined.length) {
            const currentShelfWidth = shelfMap[itemShelfId] ? shelfMap[itemShelfId].dimensions.width : shelfWidth;
            if (sh_w[itemShelfId] > currentShelfWidth && shelfDetails[itemShelfId]) {
              const combined_i = main_shelf == null ? -1 : combined.indexOf(itemShelfId);
              const combined_i_next = combined_i + 1 >= combined.length ? combined_i : combined_i + 1;
              itemShelfId = combined[combined_i_next];

              if (sh_w[itemShelfId] == null)
                sh_w[itemShelfId] = 0;
              if (!shelfItemsMap[itemShelfId])
                shelfItemsMap[itemShelfId] = [];
            }
            else break;
            item_sh_i++;
          }
          if (!item_placed.has(item.id) && shelfItemsMap[itemShelfId].indexOf(item) === -1) {
            shelfItemsMap[itemShelfId].push(item);
            item_placed.add(item.id);
            sh_w[itemShelfId] += productWidth * item.placement.faces;
          }
        }
      }
    }
  }
  return {
    ...store,
    aisles: store.aisles.map((aisle, aisle_index) => ({
      ...aisle,
      sections: aisle.sections.map((section, section_index) => ({
        ...section,
        shelves: section.shelves.map((shelf, shelf_index) => ({
          ...shelf,
          items: (shelfItemsMap[shelf.id] ? shelfItemsMap[shelf.id] : shelf.items).map((item, item_index) => ({
            ...item,
            placement: validatePlacementObject(item.placement),
            id: PLANOGRAM_ID.AISLE + aisle.aisle_id + PLANOGRAM_ID.SECTION + section_index + PLANOGRAM_ID.SHELF + shelf_index + PLANOGRAM_ID.ITEM + item_index
          })),
          id: PLANOGRAM_ID.AISLE + aisle.aisle_id + PLANOGRAM_ID.SECTION + section_index + PLANOGRAM_ID.SHELF + shelf_index
        })),
        id: PLANOGRAM_ID.AISLE + aisle.aisle_id + PLANOGRAM_ID.SECTION + section_index,
      })),
      index: aisle_index,
      id: PLANOGRAM_ID.AISLE + aisle.aisle_id
    }))
  };
}

export function storeReducer(state: AppState, action: PlanogramActions): PlanogramStore | null {
  switch (action.type) {
    case STORE_ACTIONS.SET_VIEW: {
      if (!action.store) return null;
      const newStore = {
        ...action.store,
        aisles: action.store.aisles.map((aisle, aisle_index) => ({
          ...aisle,
          sections: aisle.sections.map((section, section_index) => ({
            ...section,
            shelves: section.shelves.map((shelf, shelf_index) => ({
              ...shelf,
              items: shelf.items.map((item, item_index) => {
                const product = state.catalog.productsMap[item.product];
                let placement = { ...item.placement };
                if (product && product.length) {
                  /*Barak 5.1.20 - remove: 
                  placement.row = Math.floor(shelf.dimensions.depth / product.length) | 1; 
                  ***********************/
                  /*Barak 5.1.20 - remove: 
                  let row = Math.floor(shelf.dimensions.depth / product.length);
                  if (row <= 0) row = 1;
                  placement.row = row;
                  ***********************/
                  /*Barak 16.1.20 - replace with: */
                  let row = 1;
                  let manual_row_only = placement.manual_row_only;
                  if (!manual_row_only) {
                    row = Math.floor(shelf.dimensions.depth / product.length);
                    if (row <= 0) row = 1;
                    placement.row = row;
                  }
                }
                placement = validatePlacementObject(placement);
                return {
                  ...item,
                  placement,
                  id: PLANOGRAM_ID.AISLE + aisle.aisle_id + PLANOGRAM_ID.SECTION + section_index + PLANOGRAM_ID.SHELF + shelf_index + PLANOGRAM_ID.ITEM + item_index
                };
              }),
              id: PLANOGRAM_ID.AISLE + aisle.aisle_id + PLANOGRAM_ID.SECTION + section_index + PLANOGRAM_ID.SHELF + shelf_index
            })),
            id: PLANOGRAM_ID.AISLE + aisle.aisle_id + PLANOGRAM_ID.SECTION + section_index,
          })),
          index: aisle_index,
          id: PLANOGRAM_ID.AISLE + aisle.aisle_id
        }))
      };

      // shelfDetails["asd"].
      return fixStoreShelfItems(newStore, state.catalog.productsMap);
      return newStore;
    }
    case STORE_ACTIONS.RENAME: {
      if (state.planogram.store == null)
        return state.planogram.store;
      return {
        ...state.planogram.store,
        name: action.name
      };
    }
    case AISLE_ACTIONS.ADD_AISLE:
    case AISLE_ACTIONS.SET_AISLE:
    case AISLE_ACTIONS.ADD_SECTION:
    case AISLE_ACTIONS.EDIT_AISLE_NAME:
    case AISLE_ACTIONS.REMOVE_AISLE:
    case SECTION_ACTIONS.ADD_SECTION:
    case SECTION_ACTIONS.DELETE_SECTION:
    case SECTION_ACTIONS.DUPLICATE_SECTION:
    case SECTION_ACTIONS.EDIT_SECTION_DIMENSION:
    case SECTION_ACTIONS.SWITCH_SECTIONS:
    case SECTION_ACTIONS.REMOVE_ITEMS:
    case SHELF_ACTIONS.ADD_SHELF:
    case SHELF_ACTIONS.DELETE_SHELF:
    case SHELF_ACTIONS.DUPLICATE_SHELF:
    case SHELF_ACTIONS.EDIT_SHELF_DIMENSIONS:
    case SHELF_ACTIONS.SWITCH_SHELVES:
    case ITEM_ACTIONS.ADD_PRODUCT:
    case ITEM_ACTIONS.DELETE_ITEM:
    case ITEM_ACTIONS.DUPLICATE_ITEM:
    case ITEM_ACTIONS.EDIT_ITEM_PLACEMENT:
    case ITEM_ACTIONS.SWITCH_ITEMS:
      if (state.planogram.store == null)
        return state.planogram.store;
      return aisleReducer(state.planogram.store, action);
    default:
      return state.planogram.store;
  }
}