import React, {Children, isValidElement, cloneElement, createContext, forwardRef, useContext, useRef, useEffect} from 'react';
import { useTheme } from '@material-ui/core/styles';
import { VariableSizeList } from 'react-window';
import {ListSubheader, useMediaQuery} from '@material-ui/core';


const LISTBOX_PADDING = 8; // px

const renderRow = (props) => {
    const { data, index, style } = props;
    return cloneElement(data[index], {
        style: {
        ...style,
        top: style.top + LISTBOX_PADDING,
        },
    });
}

const OuterElementContext = createContext({});

const OuterElementType = forwardRef((props, ref) => {
  const outerProps = useContext(OuterElementContext);
  return <div ref={ref} {...props} {...outerProps} />;
});

function useResetCache(data) {
    const ref = useRef(null);
    useEffect(() => {
        if (ref.current != null) {
        ref.current.resetAfterIndex(0, true);
        }
    }, [data]);
    return ref;
}

const ListboxComponent = forwardRef(function ListboxComponent(props, ref) {
    const { children, ...other } = props;
    const itemData = Children.toArray(children);
    const theme = useTheme();
    const smUp = useMediaQuery(theme.breakpoints.up('sm'), { noSsr: true });
    const itemCount = itemData.length;
    const itemSize = smUp ? 36 : 48;

    const getChildSize = (child) => {
        if (isValidElement(child) && child.type === ListSubheader) {
        return 48;
        }

        return itemSize;
    };

    const getHeight = () => {
        if (itemCount > 8) {
        return 8 * itemSize;
        }
        return itemData.map(getChildSize).reduce((a, b) => a + b, 0);
    };

    const gridRef = useResetCache(itemCount);

    return (
        <div ref={ref}>
        <OuterElementContext.Provider value={other}>
            <VariableSizeList
            itemData={itemData}
            height={getHeight() + 2 * LISTBOX_PADDING}
            width="100%"
            ref={gridRef}
            outerElementType={OuterElementType}
            innerElementType="ul"
            itemSize={(index) => getChildSize(itemData[index])}
            overscanCount={5}
            itemCount={itemCount}
            >
                {renderRow}
            </VariableSizeList>
        </OuterElementContext.Provider>
        </div>
    );
});

export default React.memo(ListboxComponent);