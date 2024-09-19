export const chunkArray = (array: any[], size: number) => {
    if (array.length <= 2) return [array]; // return the array as a single row if there are only two dates
    return array.reduce((resultArray: any[][], item: any, index: number) => {
      const chunkIndex = Math.floor(index / size);
  
      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = []; // start a new chunk
      }
      resultArray[chunkIndex].push(item);
      return resultArray;
    }, []);
  };
  