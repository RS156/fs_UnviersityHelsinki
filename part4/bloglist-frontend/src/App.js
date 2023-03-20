import { useState, useEffect, useRef } from 'react'
import Blog from './components/Blog'
import CreateBlog from './components/CreateBlog'
import Login from './components/Login'
import Utils from './components/Utils'
import blogService from './services/blogs'
import Togglable from './components/Togglable'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  const [notification, setNotification] = useState({info:null, className:null})
  const blogFormRef = useRef()  

  useEffect(() => {
    const getData = async () =>{
      setBlogs (await blogService.getAll())      
    }  
    getData()
  }, [])


  useEffect(() => {
    const JsonUser = window.localStorage.getItem('loggedinBlogAppUser')
    
    if(JsonUser)
    {
      const u = JSON.parse(JsonUser)
      setUser(u) 
      
    }  
        
  }, [])

  useEffect(() => {
    if(user)
    {
      blogService.setToken(user.token)
    }
  }, [user])

  console.log('render check', notification)

  const handleLogout =() => {
    window.localStorage.clear()
    setUser(null)
  }

  const setNotificationWithTimeout = (notification, time =5000) =>
  {
    console.log('in set notification', notification);
    setNotification(notification)
    setTimeout(()=>{
      setNotification({info:null, className:null})
    }, time)
  }

  const handleOnDelete =  async (blog) => {
    if(window.confirm(`remove blog ${blog.title} by ${blog.author}`))
    {   
        await blogService.deleteOne(blog.id)
        setBlogs(await blogService.getAll())
    }}

    const handleOnLike = async (blog, setLikes) => {
      const request = blog
      request.likes=request.likes + 1
      request.user = request.user?._id
      const response = await blogService.update(blog.id, request)
      setLikes(response.likes)
    }

    const handleOnCreate = async (title, author, url) =>{      
      try{
        const response = await blogService.create({title, author, url})
        setNotificationWithTimeout({info:`a new blog '${response.title}' by ${response.author} added`, 
        className:'notification'})
      setBlogs(await blogService.getAll())           
      }
      catch(exception)
      {
        setNotificationWithTimeout({info:`blog was not added. Message ${exception.message}`, 
        className:'notification error'})
      }
      blogFormRef.current.toggleVisibility()    
    }

  const Blogs = () => (<div>
    <h2>blogs</h2>  
    <Utils.Notification info={notification.info} className={notification.className} />    
    <div>{user.name} logged in <button onClick={handleLogout}>logout</button></div>     
    <br />
    <CreateBlog  onCreate={handleOnCreate} />    
    {blogs.sort((a,b) => {
      return ((a.likes>b.likes) ? -1 
      : (a.likes<b.likes) ? 1 :0) 
    })
    .map(blog =>
    <Blog key={blog.id} blog={blog} user={user}
    onDelete={handleOnDelete} onLike={handleOnLike}/>)}

  </div> 
  )
  
  return (
    <div>     
      {!user && <Login userState={[user, setUser]} displayNotification={setNotificationWithTimeout}
      notificationState = {[notification, setNotification]}/>}
      {user && <Blogs />}
      </div>)     
} 

  

export default App