import React from 'react';

import { AnyAction } from 'redux';
import { AppState } from 'shared/store/app.reducer';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import { fetchBranchStores, deletePlanogramStore, createNewStore } from 'shared/api/planogram.provider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faEdit, faPlusCircle, faEye, faPlusSquare, faRuler } from '@fortawesome/free-solid-svg-icons';
import { connect } from 'react-redux';
import { ThunkDispatch } from 'redux-thunk';
import { setDisplayBranch } from 'shared/store/planogram/planogram.actions';
import { PLANOGRAM_BASE_URL } from '../PlanogramScreen';
import { uiNotify } from 'shared/components/Toast';
import { AuthRenderer } from 'shared/components/Auth';


type StateType = {
    loading: boolean,
    storeList: any[],
    branchId: string
}

function mapStateToProps(state: AppState, props: { branch_id?: string } & RouteComponentProps<{ branch_id: string }>) {
    return {
        ...props,
        user: state.auth.user
    }
};
function mapDispatchToProps(dispatch: ThunkDispatch<AppState, {}, AnyAction>) {
    return {
        setDisplayBranch: (branchId: number) => dispatch(setDisplayBranch(branchId)),
        // newStore: (branchId: number, cb: Function) => {
        //     dispatch(cleanStore(branchId))
        //     dispatch((dispatch) => {
        //         dispatch(setDisplayAisle(0));
        //         dispatch(() => cb());
        //     })
        // }
    }
}

type PlanogramStateProps = ReturnType<typeof mapStateToProps> & ReturnType<typeof mapDispatchToProps>

class PlanogramSelection extends React.Component<PlanogramStateProps> {
    state: StateType = {
        loading: true,
        storeList: [],
        branchId: this.props.branch_id || this.props.match.params.branch_id
    }
    componentDidMount() {
        const { branchId } = this.state;
        if (branchId == null || branchId === "")
            return this.props.history.goBack();
        this.getStoreList(branchId);
    }
    getStoreList = (branchId: string) => {
        this.setState({ loading: true });
        fetchBranchStores(branchId).then(stores => {
            this.setState({
                loading: false,
                storeList: stores,
            });
        }).catch(err => {
            console.error(err);
            this.setState({
                loading: false,
            })
        });
    }
    componentWillReceiveProps(nextProps: any) {
        if (nextProps.match.params.branch_id !== this.props.match.params.branch_id) {
            this.setState({
                branchId: nextProps.match.params.branch_id
            });
            this.getStoreList(nextProps.match.params.branch_id);
        }
    }

    render() {
        const { params } = this.props.match;
        const { history } = this.props;

        const { storeList, loading } = this.state;
        const branchId = parseInt(params.branch_id);
        if (loading)
            return <div className="selection-content loader"></div>
        return (
            <div className="selection-content-inner">
                <div className="selection-toolbar">
                    <AuthRenderer level={10}>
                        <div
                            className="selection-add"
                            onClick={(e) => {
                                this.setState({
                                    loading: true
                                })
                                createNewStore(branchId).then(store => {
                                    this.setState({
                                        loading: false
                                    })
                                    history.push(`${PLANOGRAM_BASE_URL}/editor/${store.store_id}`)
                                }).catch(err => {
                                    uiNotify("Unable to create new store");
                                    this.setState({
                                        loading: false
                                    })
                                })
                            }}>
                            <FontAwesomeIcon icon={faPlusCircle} />
                            <span>Create New Store</span>
                        </div>
                    </AuthRenderer>
                </div>
                <div className="planogram-store-select">
                    {storeList != null && storeList.length > 0 ? storeList.map((store, storeIndex) => {
                        return <div
                            key={"store_option_" + (store.id ? store.id : storeIndex)}
                            className="selection-store">
                            <div className="selection-store-title">{store.name || "STORE: " + store.id}</div>
                            <AuthRenderer level={50}>
                                <Link
                                    className="selection-store-action"
                                    to={{
                                        pathname: PLANOGRAM_BASE_URL + "/document/" + store.id,
                                    }}>
                                    <FontAwesomeIcon icon={faPlusSquare} />
                                </Link>
                            </AuthRenderer>
                            <AuthRenderer level={50}>
                                <Link
                                    className="selection-store-action"
                                    to={{
                                        pathname: PLANOGRAM_BASE_URL + "/dimension",
                                    }}>
                                    <FontAwesomeIcon icon={faRuler} />
                                </Link>
                            </AuthRenderer>
                            <AuthRenderer level={50}>
                                <Link
                                    className="selection-store-action"
                                    to={{
                                        pathname: PLANOGRAM_BASE_URL + "/view/" + store.id,
                                    }}>
                                    <FontAwesomeIcon icon={faEye} />
                                </Link>
                            </AuthRenderer>
                            <AuthRenderer level={10}>
                                <Link
                                    className="selection-store-action"
                                    to={{
                                        pathname: PLANOGRAM_BASE_URL + "/editor/" + store.id,
                                    }}>
                                    <FontAwesomeIcon icon={faEdit} />
                                </Link>
                            </AuthRenderer>
                            <AuthRenderer level={10}>
                                <div
                                    className="selection-store-action"
                                    onClick={e => {
                                        e.preventDefault();
                                        if (window.confirm("Are you sure you want to delete: " + store.name + "?")) {
                                            this.setState({ loading: true });
                                            if (branchId != null)
                                                deletePlanogramStore(store.id)
                                                    .then(() => fetchBranchStores(branchId))
                                                    .then(stores => this.setState({ loading: false, storeList: stores }))
                                                    .catch(err => {
                                                        console.error(err);
                                                        this.setState({ loading: false });
                                                    })
                                        }
                                    }}>
                                    <FontAwesomeIcon icon={faTrash} />
                                </div>
                            </AuthRenderer>
                        </div>
                    }) : (<div className="selection-message">No stores found...</div>)}
                </div>
            </div>
        )
    }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PlanogramSelection));