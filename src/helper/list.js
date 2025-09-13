import { useState } from 'react';

export default function () {
    const [list, setList] = useState([]);

    const addToList = (...items) => {
        setList([...list, ...items]);
    };
    const removeFromList = (...items) => {
        if (items.length == 1 && typeof items[0] === "function") {
            setList(list.filter((f) => !items[0](f)));
        } else {
            const spliced = items.reduce((newList, f) => {
                const index = newList.findIndex((c) => c === f);
                if (index == -1) {
                    return newList;
                }
                return newList.toSpliced(index, 1);
            }, list);
            setList(spliced);
        }
    };
    const replaceItemInList = (oldItem, newItem) => {
        const searchFunction = typeof oldItem === "function" ? oldItem : (c) => c === oldItem;
        const index = list.findIndex(searchFunction);
        if (index != -1) {
            setList(list.toSpliced(index, 1, newItem));
        }
    };

    return [list, addToList, removeFromList, replaceItemInList];
}