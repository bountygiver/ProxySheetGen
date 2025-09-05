import { useState } from 'react';

export default function () {
    const [list, setList] = useState([]);

    const addToList = (...items) => {
        setList([...list, ...items]);
    };
    const removeFromList = (item) => {
        const searchFunction = typeof item === "function" ? item : (c) => c === item;
        const index = list.findIndex(searchFunction);
        if (index != -1) {
            setList(list.toSpliced(index, 1));
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