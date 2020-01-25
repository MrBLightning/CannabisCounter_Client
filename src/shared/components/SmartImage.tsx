import placeholderImage from '../../assets/images/placeholder-image.png';

export function errorImageHandler(e: any) {
    e.preventDefault();
    e.target.src = placeholderImage
}