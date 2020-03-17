let dropArea = null
let timeout = null

document.addEventListener('DOMContentLoaded', setEvents, false)

function setEvents () {
    dropArea = document.querySelector('#upload')
    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName =>
    {
        dropArea.addEventListener(eventName, preventDefaults, false)
    })

    ;['dragenter', 'dragover'].forEach(eventName =>
    {
        dropArea.addEventListener(eventName, highlight, false)
    })

    ;['dragleave', 'drop'].forEach(eventName =>
    {
        dropArea.addEventListener(eventName, unhighlight, false)
    })

    dropArea.addEventListener('drop', handleDrop, false)
}

function preventDefaults (event)
{
    event.preventDefault()
    event.stopPropagation()
}

function highlight ()
{
    document.body.classList.add('highlight')
}

function unhighlight ()
{
    document.body.classList.remove('highlight')
}

async function handleDrop (event)
{
    let dataTransfer = event.dataTransfer
    let files = dataTransfer.files
    let formData = new FormData()

    formData.append('video', files[0])

    try
    {
        const response = await fetch('/convert', {
            method: 'POST',
            body: formData
        })

        const json = await response.json()

        if(!response.ok)
        {
            alert(json.error)

            return
        }

        poll(json.id)

    }
    catch (error)
    {
        alert(error)
    }

    document.querySelector('#processing').classList.add('active')
}

async function poll (id)
{
    try
    {
        const response = await fetch(`/status/${id}`)
        const json = await response.json()

        if (json.status === 'error')
        {
            clearTimeout(timeout)
            alert('Error while converting video')
            document.querySelector('#processing').classList.remove('active')

            return
        }

        if (json.status === 'done')
        {
            clearTimeout(timeout)

            let link = document.createElement('a')

            link.href = `/downloads/${json.id}.zip`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            delete link
            document.querySelector('#processing').classList.remove('active')
        }
    }
    catch (error)
    {
        alert(error)
    }

    timeout = setTimeout(() =>
    {
        poll(id)
    }, 5000)
}

