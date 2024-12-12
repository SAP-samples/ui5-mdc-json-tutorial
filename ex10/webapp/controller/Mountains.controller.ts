import Controller from "sap/ui/core/mvc/Controller"
import FilterBar from "sap/ui/mdc/FilterBar";
import { State } from "sap/ui/mdc/library";
import StateUtil from "sap/ui/mdc/p13n/StateUtil"

/**
 * @namespace sample.p13n.app.controller
 */
export default class MountainsController extends Controller {


	public onInit(): void {
		
	}

    public async onPress(event: Event): Promise<void> {
        const filterbar: FilterBar = this.byId("filterbar") as FilterBar;
        const state = await StateUtil.retrieveExternalState(filterbar) as State;
        const filter: State.XCondition = {
            operator: "Contains",
            values: ["m"]
        };

        state.filter = state.filter ?? {};
        state.filter.name = state.filter.name ?? [];
        state.filter.name.push(filter);

        await StateUtil.applyExternalState(filterbar, state);
    }
}